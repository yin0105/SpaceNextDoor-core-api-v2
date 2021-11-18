export interface IYotPoCreate {
  productId: string;
  productTitle: string;
  customerName: string;
  customerEmail: string;
  reviewTitle: string;
  reviewContent: string;
  reviewScore: number;
}

export interface IGetReviewsOptions {
  limit: number;
  page: number;
  rating?: number;
  productId?: number;
}

export interface IYotPoReview {
  id: number;
  rating: number;
  content: string;
  title: string;
  created_at: Date;
  user: {
    name: string;
  };
}

export interface IGetByProductResponse {
  pagination: {
    total: number;
    limit: number;
    page: number;
  };
  reviews: IYotPoReview[];
}

export interface IGetAvgRatingByProductResponse {
  total: number;
  average_rating: number;
}
