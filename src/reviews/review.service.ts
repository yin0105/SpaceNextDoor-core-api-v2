import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { UserRoles } from '../auth/users/interfaces/user.interface';
import { BookingModel } from '../bookings/booking.model';
import { BookingService } from '../bookings/booking.service';
import {
  CreateReviewPayload,
  ReviewRatingInfo,
  ReviewsPaginationInput,
  ReviewsResp,
  ReviewStatus,
} from '../graphql.schema';
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
  PayloadError,
} from '../shared/errors.messages';
import {
  ICreateReviewPayload,
  IReviewsFilter,
  ISendOrderPayload,
  ISendReviewPayload,
} from './interfaces/review.interface';
import createOrderValidator from './validation/create-review.payload';
import { YotPoReviewService } from './yotpo.service';

@Injectable()
export class ReviewService {
  private clientAppUrl = '';
  constructor(
    private readonly logger: Logger,
    private readonly yotpoService: YotPoReviewService,
    private readonly configService: ConfigService,
    private readonly bookingService: BookingService,
  ) {
    this.logger.setContext(ReviewService.name);
    this.clientAppUrl = this.configService.get<string>('app.clientApp.baseUrl');
  }

  public async validateCreateReviewPayload(
    payload: CreateReviewPayload,
  ): Promise<void> {
    try {
      await createOrderValidator.validate(payload);
    } catch (e) {
      throw PayloadError(e.message);
    }
  }

  public async create(payload: ICreateReviewPayload): Promise<boolean> {
    const booking = await this.bookingService.getById(
      {
        id: {
          _eq: payload.booking_id,
        },
      },
      {
        user_id: payload.userId,
        isAdmin: false,
        isCustomer: true,
        isHost: false,
        roles: [],
        role: UserRoles.CUSTOMER,
      },
    );

    if (!booking) {
      throw NotFoundError('Booking not found!');
    }

    if (booking.review_status === ReviewStatus.REVIEWED) {
      throw BadRequestError('This booking is already reviewed!');
    }

    try {
      await this.yotpoService.create({
        productId: String((booking as any)?.site?.id),
        productTitle: (booking as any)?.site?.name,
        customerEmail: booking?.customer.email,
        customerName: `${booking?.customer?.first_name} ${booking?.customer?.last_name}`,
        reviewTitle: payload.title,
        reviewContent: payload.content,
        reviewScore: payload.rating,
      });
    } catch (e) {
      this.logger.error(e.stack);
      throw InternalServerError('Error occurred while creating review');
    }

    await this.bookingService.markBookingAsReviewed(payload.booking_id);

    return true;
  }

  public async getAverage(siteId: number): Promise<ReviewRatingInfo> {
    return this.yotpoService.getAvgRatingByProduct(siteId);
  }

  public async sendReviewReminderEmail(
    payload: ISendReviewPayload,
  ): Promise<boolean> {
    const { bookingId, email } = payload;

    try {
      await this.yotpoService.sendAutomaticReviewReminder(email);
    } catch (e) {
      this.logger.error(e.stack);
      throw InternalServerError(
        `Error occurred while sending review reminder for bookingId: ${bookingId}`,
      );
    }

    await this.bookingService.markBookingAsRemindedReview(bookingId);

    return true;
  }

  public async sendRequestReviewOrders(payload: number[]): Promise<boolean> {
    /**
     * Find bookings record with ids provided
     *
     */
    let bookings: BookingModel[] = [];
    try {
      bookings = await this.bookingService.requestReviewToActiveBookings(
        payload,
      );
    } catch (error) {
      this.logger.error(error.stack);
      throw new Error(
        'Error occurred while finding bookings with provided Ids to send review request',
      );
    }

    if (bookings.length === 0) {
      this.logger.log('No booking founds with provided Ids');
      return false;
    }

    const yotpoPayload = bookings.map(
      (booking): ISendOrderPayload => ({
        customerEmail: booking.customer?.email,
        customerName: booking.customer_name,
        bookingId: booking.id,
        moveInDate: booking.move_in_date,
        siteId: booking.site_id,
        siteUrl: `${this.clientAppUrl}/details/${booking.site_id}`,
        siteTitle: booking.site_name,
        siteImage: booking.site?.images?.[0],
      }),
    );
    let success = false;
    try {
      success = await this.yotpoService.createMassOrders(yotpoPayload);
    } catch (error) {
      this.logger.error(error.stack);
      throw new Error('Error occurred while sending order to review');
    }

    if (success) {
      // update booking schedule status
      try {
        await this.bookingService.updateReviewSchedule(
          ReviewStatus.SCHEDULED,
          payload,
        );
      } catch (error) {
        this.logger.error(error.stack);
        this.logger.warn('Not able to update review schedule');
      }
    }
    return success;
  }

  public async get(
    pagination: ReviewsPaginationInput,
    filter: IReviewsFilter,
  ): Promise<ReviewsResp> {
    const resp = await this.yotpoService.get({
      ...pagination,
      productId: filter.siteId,
      rating: filter.rating,
    });

    return {
      edges: resp.reviews,
      page_info: {
        ...resp.pagination,
        has_more:
          resp.pagination.total - resp.pagination.page * resp.pagination.limit >
          0,
      },
    };
  }
}
