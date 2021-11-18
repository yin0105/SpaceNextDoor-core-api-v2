import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { stringify } from 'query-string';

import { ISendOrderPayload } from './interfaces/review.interface';
import {
  IGetAvgRatingByProductResponse,
  IGetByProductResponse,
  IGetReviewsOptions,
  IYotPoCreate,
  IYotPoReview,
} from './interfaces/yotpo.interface';
@Injectable()
export class YotPoReviewService {
  private token: string = null;
  private baseURL = 'https://api.yotpo.com';
  private apiKey = '';
  private apiSecret = '';

  constructor(
    private readonly logger: Logger,
    private readonly config: ConfigService,
  ) {
    this.apiKey = this.config.get('app.yotpo.apiKey');
    this.apiSecret = this.config.get('app.yotpo.apiSecret');
    this.logger.setContext(YotPoReviewService.name);
  }

  private async login() {
    const res = await axios.post(`${this.baseURL}/oauth/token`, {
      client_id: this.apiKey,
      client_secret: this.apiSecret,
      grant_type: 'client_credentials',
    });
    if (!res.data.access_token) {
      throw new Error('Unable to get access token');
    }
    this.token = res.data.access_token;
  }

  private async ensureLoggedIn() {
    if (!this.token) {
      await this.login();
    }
  }

  public async create(payload: IYotPoCreate): Promise<void> {
    const res = await axios.post(`${this.baseURL}/v1/widget/reviews`, {
      appkey: this.apiKey,
      domain: this.config.get('app.webURL'),
      sku: `${this.config.get('app.nodeEnv')}_${payload.productId}`,
      product_title: payload.productTitle,
      product_url: `${this.config.get('app.webURL')}/details/${
        payload.productId
      }`,
      display_name: payload.customerName,
      email: payload.customerEmail,
      review_content: payload.reviewContent,
      review_title: payload.reviewTitle,
      review_score: payload.reviewScore,
    });

    if (res.data.code !== 200) {
      this.logger.log(res.data);
      throw new Error('Error occurred while creating review');
    }
  }

  public async createMassOrders(
    payload: ISendOrderPayload[],
  ): Promise<boolean> {
    await this.ensureLoggedIn();
    const orders = payload.map((item) => {
      const sku = `${this.config.get('app.nodeEnv')}_${item.siteId}`;
      const {
        customerEmail,
        customerName,
        bookingId,
        moveInDate,
        siteUrl,
        siteTitle,
        siteImage,
      } = item;
      return {
        email: customerEmail,
        customer_name: customerName,
        order_id: bookingId,
        order_date: moveInDate,
        products: {
          [sku]: {
            url: siteUrl,
            name: siteTitle,
            image: siteImage,
          },
        },
      };
    });

    // console.log(orders);
    // return true;
    const res = await axios.post(
      `${this.baseURL}/apps/${this.apiKey}/purchases/mass_create.json`,
      {
        platform: 'general',
        utoken: this.token,
        orders,
      },
    );

    if (res.data?.code !== 200) {
      throw new Error(
        `Error while request send order to yotpo ${res.data?.code}`,
      );
    }
    return true;
  }

  public async sendAutomaticReviewReminder(email: string): Promise<boolean> {
    const res = await axios.post(
      `${this.baseURL}/apps/${this.apiKey}/reminders/send_test_email`,
      {
        utoken: this.token,
        email_type: 'map',
        email,
      },
    );

    if (res.data.status?.code !== 200) {
      this.logger.log(res.data);
      throw new Error('Error occurred while sending review reminder email');
    }
    return true;
  }

  public async getAvgRatingByProduct(
    productId: number,
  ): Promise<IGetAvgRatingByProductResponse> {
    const query = stringify({
      per_page: 10,
      page: 1,
    });
    const id = `${this.config.get('app.nodeEnv')}_${productId}`;
    const res = await axios.get(
      `${this.baseURL}/v1/widget/${this.apiKey}/products/${id}/reviews.json?${query}`,
    );

    if (res.data?.status?.code !== 200) {
      throw new Error('Error while getting rating');
    }

    return {
      total: res?.data?.response?.bottomline?.total_review,
      average_rating: res?.data?.response?.bottomline?.average_score,
    };
  }

  public async get(
    options: IGetReviewsOptions,
  ): Promise<IGetByProductResponse> {
    const query = stringify({
      per_page: options.limit,
      page: options.page,
    });
    const id = `${this.config.get('app.nodeEnv')}_${options.productId}`;
    const body: any = {};

    if (options.productId) {
      body.domain_key = id;
    }

    if (options.rating) {
      body.scores = [options.rating];
    }

    const res = await axios.post(
      `${this.baseURL}/v1/reviews/${this.apiKey}/filter.json?${query}`,
      body,
    );

    if (res.data?.status?.code !== 200) {
      throw new Error('Error while getting reviews');
    }

    const reviews: IYotPoReview[] = (res.data?.response?.reviews || []).map(
      (rev) => ({
        id: rev.id,
        content: rev.content,
        title: rev.title,
        rating: rev.score,
        created_at: rev.created_at,
        user: {
          name: rev.user?.display_name,
        },
      }),
    );

    return {
      pagination: {
        total: res.data?.response?.pagination?.total,
        ...options,
      },
      reviews,
    };
  }
}
