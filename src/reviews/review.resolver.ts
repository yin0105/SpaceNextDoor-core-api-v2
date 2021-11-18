import { Logger } from '@nestjs/common';
import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

import { Auth, AuthUser, IAuthUser } from '../auth/auth.decorators';
import { UserRoles } from '../auth/users/interfaces/user.interface';
import {
  CreateReviewPayload,
  ReviewRatingInfo,
  ReviewsPaginationInput,
  ReviewsResp,
  ReviewsWhereFilterInput,
} from '../graphql.schema';
import { ReviewService } from './review.service';

@Resolver('ReviewsResp')
export class ReviewResolver {
  constructor(
    private readonly reviewService: ReviewService,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(ReviewResolver.name);
  }

  @Auth(UserRoles.CUSTOMER)
  @Mutation('createReview')
  async createReview(
    @Args('payload') payload: CreateReviewPayload,
    @AuthUser() auth: IAuthUser,
  ): Promise<boolean> {
    await this.reviewService.validateCreateReviewPayload(payload);

    return this.reviewService.create({ ...payload, userId: auth.user_id });
  }

  @Query('reviews')
  async getReviews(
    @Args('where') where: ReviewsWhereFilterInput,
    @Args('pagination') pagination: ReviewsPaginationInput,
  ): Promise<ReviewsResp & { siteId: number }> {
    const res = await this.reviewService.get(pagination, {
      rating: where?.rating?._eq,
      siteId: where?.site_id?._eq,
    });

    return {
      ...res,
      // Hack to pass siteId to child resolver
      siteId: where.site_id?._eq,
    };
  }

  @ResolveField('rating_info')
  async getAvg(
    @Parent() parent: { siteId: number },
  ): Promise<ReviewRatingInfo> {
    if (parent.siteId) {
      return this.reviewService.getAverage(parent.siteId);
    }
  }
}
