import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import AWS from 'aws-sdk';
import mime from 'mime-types';
import stream from 'stream';

import {
  IOpenReadStreamParams,
  IOpenWriteStreamParams,
  IS3Config,
} from './interfaces/media.interface';

@Injectable()
export class S3Service {
  private s3Client: AWS.S3 = null;
  constructor(
    private readonly logger: Logger,
    private readonly configService: ConfigService,
  ) {
    this.logger.setContext(S3Service.name);
    this.s3Client = new AWS.S3(this.getS3Config());
  }

  private getS3Config(): IS3Config {
    return {
      accessKeyId: this.configService.get<string>('app.s3.accessKey'),
      secretAccessKey: this.configService.get<string>('app.s3.secretAccessKey'),
      region: this.configService.get<string>('app.s3.region'),
    } as IS3Config;
  }

  public openReadStream({ key, bucket }: IOpenReadStreamParams) {
    return this.s3Client
      .getObject({
        Bucket: bucket,
        Key: key,
      })
      .createReadStream();
  }

  public openWriteStream({ key, contentType, bucket }: IOpenWriteStreamParams) {
    contentType = contentType || (mime.contentType(key) as string);

    if (!contentType) {
      throw new Error('contentType is required to upload files to s3');
    }

    const passThrough = new stream.PassThrough();
    return {
      uploadStream: passThrough,
      done: this.s3Client
        .upload({
          ContentType: contentType,
          Body: passThrough,
          Bucket: bucket,
          Key: key,
          ACL: 'public-read',
        })
        .promise(),
    };
  }

  public uploadBuffer({
    key,
    contentType,
    bucket,
    buffer,
    isPrivate = false,
  }: IOpenWriteStreamParams & { buffer: Buffer }) {
    return this.s3Client
      .upload({
        ContentType: contentType,
        Body: buffer,
        Bucket: bucket,
        Key: key,
        ACL: isPrivate ? 'private' : 'public-read',
      })
      .promise();
  }

  public deleteImage(key: string, bucket: string) {
    return this.s3Client
      .deleteObject({
        Bucket: bucket,
        Key: key,
      })
      .promise();
  }
}
