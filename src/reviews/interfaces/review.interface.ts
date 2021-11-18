import { CreateReviewPayload } from '../../graphql.schema';

export interface ICreateReviewPayload extends CreateReviewPayload {
  userId: number;
}

export interface ISendReviewPayload {
  email: string;
  bookingId: number;
}

export interface ISendOrderPayload {
  customerEmail: string;
  customerName: string;
  bookingId: number;
  moveInDate: Date;
  siteId: number;
  siteUrl: string;
  siteTitle: string;
  siteImage: string;
}

export interface IReviewsFilter {
  siteId?: number;
  rating?: number;
}
