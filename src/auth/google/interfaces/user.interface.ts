interface IName {
  familyName: string;
  givenName: string;
}

interface IEmail {
  value: string;
  verified: boolean;
}

interface IPhotos {
  value: string;
}

export interface IGoogleUser {
  id: string;
  name: IName;
  displayName: string;
  emails: [IEmail];
  photos: [IPhotos];
}

export enum IProvider {
  GOOGLE = 'GOOGLE',
  FACEBOOK = 'FACEBOOK',
}

export interface IOAuthUser {
  id: string;
  provider: IProvider;
  email: string;
  email_verified: boolean;
  first_name: string;
  last_name?: string;
  picture?: string;
}
