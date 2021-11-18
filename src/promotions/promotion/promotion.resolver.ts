import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

import {
  Auth,
  AuthOptional,
  AuthUser,
  IAuthUser,
} from '../../auth/auth.decorators';
import { UserRoles } from '../../auth/users/interfaces/user.interface';
import {
  ApplyPromotionInput,
  ApplyPromotionResponse,
  CustomerBuys,
  CustomerGets,
  Pagination,
  Promotion,
  PromotionFilter,
  PromotionFormat,
  PromotionInput,
  PromotionsFilter,
  PromotionsResp,
  PromotionsSort,
  PromotionStatus,
  SortBy,
} from '../../graphql.schema';
import { BadRequestError } from '../../shared/errors.messages';
import { PromotionCustomerBuysService } from '../customer_buys/customer_buys.service';
import { PromotionCustomerGetsService } from '../customer_gets/customer_gets.service';
import { PromotionService } from './promotion.service';

@Resolver('Promotion')
export class PromotionResolver {
  constructor(
    private readonly promotionService: PromotionService,
    private readonly customerBuysService: PromotionCustomerBuysService,
    private readonly customerGetsService: PromotionCustomerGetsService,
  ) {}

  @AuthOptional()
  @Query('promotions')
  async promotions(
    @AuthUser() user: IAuthUser,
    @Args('pagination') pagination: Pagination,
    @Args('where') where: PromotionsFilter = {},
    @Args('sort_by') sortBy: PromotionsSort = { created_at: SortBy.desc },
  ): Promise<PromotionsResp> {
    if (!user?.hasRole(UserRoles.ADMIN)) {
      where.status = { _eq: PromotionStatus.ACTIVE };
    }
    return await this.promotionService.findAll(pagination, where, sortBy);
  }

  @Auth(UserRoles.ADMIN)
  @Mutation('createPromotion')
  async createPromotion(
    @AuthUser() user: IAuthUser,
    @Args('payload') payload: PromotionInput,
  ): Promise<Promotion> {
    const options = {
      user_id: user.user_id,
    };

    if (payload.format === PromotionFormat.VOUCHER && !payload.code) {
      throw BadRequestError('Promotion code is required');
    }

    return await this.promotionService.create(payload, options);
  }

  @Auth(UserRoles.ADMIN)
  @Mutation('updatePromotion')
  async updatePromotion(
    @AuthUser() user: IAuthUser,
    @Args('payload') payload: PromotionInput,
    @Args('where') where: PromotionFilter,
  ): Promise<Promotion> {
    const options = {
      user_id: user.user_id,
    };

    if (payload.format === PromotionFormat.VOUCHER && !payload.code) {
      throw BadRequestError('Promotion code is required');
    }

    return await this.promotionService.update(where?.id._eq, payload, options);
  }

  @Mutation('applyPromotion')
  async applyPromotion(
    @Args('payload') payload: ApplyPromotionInput,
  ): Promise<ApplyPromotionResponse> {
    return await this.promotionService.applyPromotion(payload);
  }

  @ResolveField('customer_buys')
  async customerBuys(@Parent() promotion: Promotion): Promise<CustomerBuys[]> {
    if (promotion.customer_buys) {
      return promotion.customer_buys;
    }
    return await this.customerBuysService.findByPromoId(promotion.id);
  }

  @ResolveField('customer_gets')
  async customerGets(@Parent() promotion: Promotion): Promise<CustomerGets[]> {
    if (promotion.customer_gets) {
      return promotion.customer_gets;
    }
    return await this.customerGetsService.findByPromoId(promotion.id);
  }
}
