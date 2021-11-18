export interface IOTPEntity {
  id: number;
  otp: string;
  username: string;
  expires_at: Date;
  created_at: Date;
}
