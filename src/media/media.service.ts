import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import mime from 'mime-types';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

import {
  IFileDetails,
  IResizeImageQueryParams,
  IUploaderOptions,
  IUploadImagesQueryParams,
  IUploadResult,
} from './interfaces/media.interface';
import { S3Service } from './s3.service';
import resizeImageQueryParamsValidation from './validation/resize-image.query.params.validation';
import uploadImageQueryParamsValidation from './validation/upload-image.query.params.validation';

@Injectable()
export class MediaService {
  private bucketName: string = null;
  private defaultResizeWidth: number = null;
  private supportedMimeTypes: string[] = null;

  constructor(
    private readonly s3Service: S3Service,
    private readonly configService: ConfigService,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(MediaService.name);
    this.bucketName = this.configService.get<string>('app.s3.bucketName');
    this.defaultResizeWidth = this.configService.get<number>(
      'app.defaultResizeWidth',
    );
    this.supportedMimeTypes = this.configService
      .get<string>('app.supportMimeType')
      .split(',');
  }

  public async validateImageUploadQueryParams(
    queryParams: IUploadImagesQueryParams,
  ): Promise<void> {
    try {
      await uploadImageQueryParamsValidation.validate(queryParams);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  public async validateResizeImageQueryParams(
    queryParams: IResizeImageQueryParams,
  ): Promise<void> {
    try {
      await resizeImageQueryParamsValidation.validate(queryParams);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  public async resize(key: string, width: number, height?: number) {
    const newKey = `${key.split('.')[0]}-${width}x${height || ''}.${
      key.split('.')[1]
    }`;
    const bucket = this.bucketName;
    // If height is undefined or null, it'll maintain aspect ratio by using width only
    const streamResize = sharp().resize(width, height);

    const readStream = this.s3Service.openReadStream({ bucket, key });
    const { uploadStream, done } = this.s3Service.openWriteStream({
      bucket,
      key: newKey,
    });
    /**
     * Get image from S3 and simultaneously push it to the resize function. After that
     * directly upload that stream to s3 with new key provided.
     */
    readStream.pipe(streamResize).pipe(uploadStream);

    return (await done).Key;
  }

  public async upload(
    files: IFileDetails[],
    options: IUploaderOptions = {
      compressImage: false,
      resizeWidth: this.defaultResizeWidth,
      uploadType: '',
      isPrivate: false,
    },
  ) {
    const resizeWidth = options?.resizeWidth || this.defaultResizeWidth;
    const result: IUploadResult[] = [];
    /**
     * By default, Promise.all will stop and error out if any of the promises
     * return error, by catching the error inside. We make sure this doesn't happen
     * Since stopping other file uploads could be expensive for the clients to send again
     */
    await Promise.all(
      files.map(async (file, i) => {
        const { file: fileBuffer, mimeType, ext } = file;

        if (this.isMimeSupported(mimeType)) {
          this.logger.error(`Filetype not supported: ${mimeType}`);
          return (result[i] = this.generateErrorRes(
            /* eslint-disable @typescript-eslint/restrict-template-expressions */
            `Err: Expected file types: [${this.supportedMimeTypes}], instead got [${mimeType}]`,
            'UNSUPPORTED_FILE_TYPE',
          ));
        }

        try {
          let buffer = fileBuffer;

          if (this.isImage(mimeType)) {
            this.logger.log(
              `File is an image, passing to image library: ${mimeType}`,
            );
            /**
             * Sharp.resize() expects width and height respectively. When height is undefined
             * its gonna keep the aspect ratio of the image.
             * Rotation of image is determined from the EXIF data.
             */
            let sharpInstance = sharp(fileBuffer)
              .rotate()
              .resize(parseInt(resizeWidth.toString(), 10));

            if (options.compressImage) {
              sharpInstance = sharpInstance.jpeg({ quality: 81 });
            }

            buffer = await sharpInstance.toBuffer();
          }

          const s3Result = await this.s3Service.uploadBuffer({
            buffer,
            contentType: mimeType,
            key: this.getFileKey(options.uploadType, ext),
            bucket: this.bucketName,
            isPrivate: options.isPrivate,
          });

          return (result[i] = {
            error: null,
            key: s3Result.Key,
          });
        } catch (e) {
          this.logger.error('Unknown server error occurred', e);
          return (result[i] = this.generateErrorRes(
            e.message || e,
            'UNEXPECTED_ERROR',
          ));
        }
      }),
    );

    return result;
  }

  private isImage(mimeType: string) {
    return mimeType.indexOf('image') >= 0;
  }

  private getFileKey(uploadType: string, ext: string) {
    /* eslint-disable @typescript-eslint/restrict-template-expressions */
    const fileName = `${uuidv4()}.${ext}`;

    switch (uploadType) {
      case 'space':
        return `uploads/space/${fileName}`;
      case 'site':
        return `uploads/site/${fileName}`;
      default:
        return `uploads/${fileName}`;
    }
  }

  private generateErrorRes(err: string, code: string) {
    return {
      key: null,
      error: {
        message: err,
        code,
      },
    };
  }

  private isMimeSupported(type: string) {
    return !this.supportedMimeTypes.includes(type);
  }

  public getExtensionFromContentType(mimeType: string) {
    return mime.extension(mimeType);
  }
}
