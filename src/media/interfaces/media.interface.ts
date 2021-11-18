export interface IOpenWriteStreamParams {
  key: string;
  contentType?: string;
  bucket: string;
  isPrivate?: boolean;
}

export interface IOpenReadStreamParams {
  key: string;
  bucket: string;
  isPrivate?: boolean;
}

export interface IFileDetails {
  file: Buffer;
  ext: string;
  mimeType: string;
}

export interface IS3Config {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
}

export interface IUploaderOptions {
  compressImage: boolean;
  resizeWidth: number;
  uploadType: string;
  isPrivate?: boolean;
}

export interface IUploadResult {
  error?: {
    message: string;
    code: string;
  };
  key?: string;
}

export interface IUploadImagesQueryParams {
  compressImage: boolean;
  resizeWidth: number;
  uploadType: string;
  isPrivate?: boolean;
}

export interface IUploadImagesResult {
  bucketUrl: string;
  files: IUploadResult[];
}

export interface IResizeImageQueryParams {
  size: string;
  imageKey: string;
}

export interface IResizeImageResult {
  bucketUrl: string;
  key: string;
}

export interface IDeleteImageQueryParams {
  imageKey: string;
}

export interface IDeleteImageResult {
  code: number;
  success: boolean;
}
