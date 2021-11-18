import {
  BadRequestException,
  Controller,
  Get,
  InternalServerErrorException,
  Logger,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FilesInterceptor } from '@nestjs/platform-express';

import { Auth } from '../auth/auth.decorators';
import { UserRoles } from '../auth/users/interfaces/user.interface';
import {
  IFileDetails,
  IResizeImageQueryParams,
  IResizeImageResult,
  IUploadImagesQueryParams,
  IUploadImagesResult,
} from './interfaces/media.interface';
import { MediaService } from './media.service';
import { S3Service } from './s3.service';

@Controller('media')
export class MediaController {
  private bucketUrl: string = null;
  constructor(
    private configService: ConfigService,
    private readonly mediaService: MediaService,
    private readonly s3Service: S3Service,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(MediaController.name);
    this.bucketUrl = this.configService.get<string>('app.s3.bucketUrl');
  }

  @Auth(UserRoles.ADMIN, UserRoles.CUSTOMER, UserRoles.PROVIDER)
  @Post('upload_images')
  @UseInterceptors(FilesInterceptor('files', 20))
  async uploadImages(
    @Query() queryParams: IUploadImagesQueryParams,
    @UploadedFiles() files,
  ): Promise<IUploadImagesResult> {
    await this.mediaService.validateImageUploadQueryParams(queryParams);
    const filesDetails: IFileDetails[] = files.map((file) => ({
      file: file.buffer,
      ext: this.mediaService.getExtensionFromContentType(file.mimetype),
      mimeType: file.mimetype,
    }));
    try {
      const uploadFileResult = await this.mediaService.upload(
        filesDetails,
        queryParams,
      );
      /* eslint-disable @typescript-eslint/restrict-template-expressions */
      this.logger.log(`Uploader result: ${uploadFileResult}`);
      return {
        bucketUrl: this.bucketUrl,
        files: uploadFileResult,
      } as IUploadImagesResult;
    } catch (e) {
      this.logger.error('Error occurred while uploading', e);
      throw new BadRequestException(
        'Something went wrong while uploading images!',
      );
    }
  }

  @Auth(UserRoles.ADMIN, UserRoles.CUSTOMER, UserRoles.PROVIDER)
  @Get('resize_image')
  async resizeImage(
    @Query() queryParams: IResizeImageQueryParams,
  ): Promise<IResizeImageResult> {
    await this.mediaService.validateResizeImageQueryParams(queryParams);
    const { size, imageKey } = queryParams;
    const sizeArray = size.split('x');
    const width = parseInt(sizeArray[0], 10);
    const height = parseInt(sizeArray[1], 10) || null;
    if (!width) {
      this.logger.error(`Width param missing or malformed size param: ${size}`);
      throw new BadRequestException(
        'The size path param should be like 40x40, instead got width undefined',
      );
    }

    try {
      const imagePath = await this.mediaService.resize(imageKey, width, height);
      this.logger.log(`Generated new image with path: ${imagePath}`);
      return {
        bucketUrl: this.bucketUrl,
        key: imagePath,
      } as IResizeImageResult;
    } catch (e) {
      this.logger.error('Error occurred while resizing and uploading', e);
      throw new InternalServerErrorException(
        'Error occurred while resizing the image!',
      );
    }
  }

  // @Delete('delete_image')
  // async deleteImage(
  //   @Query() queryParams: IDeleteImageQueryParams,
  // ): Promise<IDeleteImageResult> {
  //   if (!queryParams.imageKey) {
  //     throw new BadRequestException('Please provide image_key as query param');
  //   }
  //   try {
  //     await this.s3Service.deleteImage(queryParams.imageKey, this.bucketName);
  //     return {
  //       code: 200,
  //       success: true,
  //     } as IDeleteImageResult;
  //   } catch (e) {
  //     this.logger.error('Error occurred while deleting image', e);
  //     throw new InternalServerErrorException(
  //       'Error occurred while deleting image!',
  //     );
  //   }
  // }
}
