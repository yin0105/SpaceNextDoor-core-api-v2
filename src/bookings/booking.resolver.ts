/* eslint-disable complexity */
import { Inject, Logger } from '@nestjs/common';
import {
  Args,
  Context,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { v4 as uuidv4 } from 'uuid';

import { AppliedTaxService } from '../applied-taxes/applied-tax.service';
import { Auth, AuthUser, IAuthUser, Platform } from '../auth/auth.decorators';
import { Platform as xPlatform } from '../auth/auth.interface';
import { AuthService } from '../auth/auth.service';
import { RefreshTokenService } from '../auth/refresh_token/refresh-token.service';
import { UserRoles } from '../auth/users/interfaces/user.interface';
import { UserService } from '../auth/users/user.service';
import {
  AddPromotionsToBookingPayload,
  AddPromotionsToBookingResp,
  AppliedTax,
  Booking,
  BookingCancellation,
  BookingCancellationReasonsResp,
  BookingFilter,
  BookingHistory,
  BookingPayload,
  BookingsFilter,
  BookingSiteAddress,
  BookingsResp,
  CancelBookingPayload,
  CancelBookingResponse,
  ChangeBookingUnitPayload,
  ChangeBookingUnitResp,
  CheckOutPricePayload,
  CheckOutPriceResp,
  LoginResult,
  Order,
  Pagination,
  PayBookingPayload,
  PayBookingResp,
  PaymentScheduleResp,
  PlatformFeature,
  PlatformInsurance,
  PriceUpdatePayload,
  PriceUpdateResp,
  Renewal,
  Space,
  Termination,
  Transaction,
  UpdateBookingFilter,
  UpdateBookingPayload,
  UpdateBookingResp,
  User,
} from '../graphql.schema';
import { OrderModel } from '../orders/order.model';
import { InsuranceService } from '../platform/insurances/insurance.service';
import { ORDER_REPOSITORY } from '../shared/constant/app.constant';
import { ForbiddenError, NotFoundError } from '../shared/errors.messages';
import { SiteService } from '../sites/sites/site.service';
import { SpaceService } from '../spaces/spaces/space.service';
import { TerminationService } from '../terminations/termination.service';
import { BookingCancellationReasonsService } from './booking-cancellation-reasons/booking-cancellation-reasons.service';
import { BookingHistoryService } from './booking-history/booking-history.service';
import { BookingSiteAddressService } from './booking-site-addresses/booking-site-address.service';
import { BookingSiteFeatureService } from './booking-site-features/booking-site-feature.service';
import { BookingSpaceFeatureService } from './booking-space-features/booking-space-feature.service';
import { BookingService } from './booking.service';
import { IBookingArgs, IBookingEntity } from './interfaces/booking.interface';
import { RenewalService } from './renewals/renewal.service';
import { TransactionService } from './transactions/transaction.service';
@Resolver('Booking')
export class BookingResolver {
  constructor(
    private readonly bookingService: BookingService,
    private readonly bookingSpaceFeatureService: BookingSpaceFeatureService,
    private readonly bookingSiteFeatureService: BookingSiteFeatureService,
    private readonly bookingSiteAddressService: BookingSiteAddressService,
    private readonly bookingHistoryService: BookingHistoryService,
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly insuranceService: InsuranceService,
    private readonly siteService: SiteService,
    private readonly spaceService: SpaceService,
    private readonly renewalService: RenewalService,
    private readonly terminationService: TerminationService,
    private readonly transactionService: TransactionService,
    private readonly reasonsService: BookingCancellationReasonsService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly appliedTaxService: AppliedTaxService,
    @Inject(ORDER_REPOSITORY)
    private readonly orderEntity: typeof OrderModel,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(BookingResolver.name);
  }

  @Mutation('createBooking')
  async createBooking(
    @Args('payload') payload: BookingPayload,
  ): Promise<Booking> {
    // validate payload
    await this.bookingService.validateBookingPayload(payload);
    return await this.bookingService.create(payload);
  }

  @Auth(UserRoles.CUSTOMER)
  @Mutation('cancelBooking')
  async cancelBooking(
    @Args('payload') payload: CancelBookingPayload,
    @AuthUser() auth: IAuthUser,
  ): Promise<CancelBookingResponse> {
    return this.bookingService.cancelBooking(payload, auth.user_id);
  }

  @Auth(UserRoles.CUSTOMER, UserRoles.ADMIN)
  @Mutation('updateBooking')
  async updateBooking(
    @Args('payload') payload: UpdateBookingPayload,
    @Args('where') where: UpdateBookingFilter,
    @AuthUser() user: IAuthUser,
  ): Promise<UpdateBookingResp> {
    const args: IBookingArgs = {
      user_id: user?.user_id || null,
      role: user?.currentRequestRole,
      roles: user?.roles,
      isAdmin: user?.hasRole(UserRoles.ADMIN),
      isHost: user?.hasRole(UserRoles.PROVIDER),
      isCustomer: user?.hasRole(UserRoles.CUSTOMER),
    };
    // host can't update booking
    if (args?.isHost) {
      throw ForbiddenError();
    }

    if (!args?.isHost && args?.role === UserRoles.PROVIDER) {
      throw ForbiddenError();
    }

    return await this.bookingService.update(payload, where, args);
  }

  @Auth(UserRoles.ADMIN)
  @Mutation('updateBookingPrice')
  async updateBookingPrice(
    @Args('payload') payload: PriceUpdatePayload,
    @AuthUser() user: IAuthUser,
  ): Promise<PriceUpdateResp> {
    return await this.bookingService.updateBookingPrice(payload, user?.user_id);
  }

  @Auth(UserRoles.CUSTOMER)
  @Mutation('payBooking')
  async payBooking(
    @Args('payload') payload: PayBookingPayload,
    @AuthUser() user: IAuthUser,
  ): Promise<PayBookingResp> {
    return await this.bookingService.payBooking(payload, user.user_id);
  }

  @Mutation('calculateCheckOutPrice')
  async calculateCheckOutPrice(
    @Args('payload') payload: CheckOutPricePayload,
    @Context() context,
  ): Promise<CheckOutPriceResp> {
    const language = context?.req?.headers?.language;
    await this.bookingService.validateCheckOutPricePayload(payload, {
      language,
    });

    return this.bookingService.calculateCheckOutPrice(payload, { language });
  }

  @Auth(UserRoles.PROVIDER, UserRoles.ADMIN, UserRoles.CUSTOMER)
  @Query('booking')
  async booking(
    @Args('where') where: BookingFilter,
    @AuthUser() user: IAuthUser,
  ): Promise<Booking> {
    const role = user.currentRequestRole || UserRoles.CUSTOMER;
    if (!user.hasRole(role)) {
      throw ForbiddenError('UnAuthorized');
    }

    const options: IBookingArgs = {
      role,
      user_id: user.user_id,
      roles: user.roles,
      isAdmin: user.hasRole(UserRoles.ADMIN),
      isHost: user.hasRole(UserRoles.PROVIDER),
      isCustomer: user.hasRole(UserRoles.CUSTOMER),
    };

    const booking = await this.bookingService.getById(where, options);
    if (!booking) {
      throw NotFoundError('Booking not found!');
    }

    return booking as undefined;
  }

  @Auth(UserRoles.PROVIDER, UserRoles.ADMIN, UserRoles.CUSTOMER)
  @Query('bookings')
  async bookings(
    @AuthUser() user: IAuthUser,
    @Args('pagination') pagination: Pagination,
    @Args('where') where?: BookingsFilter,
  ): Promise<BookingsResp> {
    const role = user.currentRequestRole || UserRoles.CUSTOMER;
    if (!user.hasRole(role)) {
      throw ForbiddenError('UnAuthorized');
    }
    const options: IBookingArgs = {
      role,
      user_id: user.user_id,
      roles: user.roles,
      isAdmin: user.hasRole(UserRoles.ADMIN),
      isHost: user.hasRole(UserRoles.PROVIDER),
      isCustomer: user.hasRole(UserRoles.CUSTOMER),
    };
    return await this.bookingService.findAll(pagination, where, options);
  }

  @Query('cancellation_reasons')
  async cancellationReasons(): Promise<BookingCancellationReasonsResp> {
    return {
      edges: await this.reasonsService.findAll(),
    };
  }

  @Auth(UserRoles.ADMIN)
  @Mutation('changeBookingUnit')
  async changeBookingUnit(
    @Args('payload') payload: ChangeBookingUnitPayload,
    @AuthUser() user: IAuthUser,
  ): Promise<ChangeBookingUnitResp> {
    return await this.bookingService.changeBookingUnit(payload, user);
  }

  @Auth(UserRoles.ADMIN)
  @Mutation('addPromotionsToBooking')
  async addPromotionsToBooking(
    @Args('payload') payload: AddPromotionsToBookingPayload,
    @AuthUser() user: IAuthUser,
  ): Promise<AddPromotionsToBookingResp> {
    return await this.bookingService.addPromotionsToBooking(payload, user);
  }

  @ResolveField('site_address')
  async site_address(
    @Parent() booking: IBookingEntity,
  ): Promise<BookingSiteAddress> {
    return await this.bookingSiteAddressService.getById(
      booking.site_address_id,
    );
  }

  @ResolveField('cancellation')
  async cancellation(
    @Parent() booking: IBookingEntity,
  ): Promise<BookingCancellation> {
    return this.bookingService.getCancellationInfo(booking?.id);
  }

  @ResolveField('insurance')
  async insurance(
    @Parent() booking: IBookingEntity,
  ): Promise<PlatformInsurance> {
    return await this.insuranceService.getById(booking?.insurance_id);
  }

  @ResolveField('orders')
  async orders(@Parent() booking: IBookingEntity): Promise<Order[]> {
    const result = await this.orderEntity.findAll({
      where: { booking_id: booking?.id },
    });

    return (result as undefined) as Order[];
  }

  @ResolveField('transactions')
  async transactions(
    @Parent() booking: IBookingEntity,
  ): Promise<Transaction[]> {
    return this.transactionService.getByBookingId(booking?.id);
  }

  @ResolveField('renewals')
  async renewals(@Parent() booking: IBookingEntity): Promise<Renewal[]> {
    return this.renewalService.getByBookingId(booking?.id);
  }

  @ResolveField('auth')
  async auth(
    @Parent() booking: IBookingEntity,
    @Platform() platform: xPlatform,
  ): Promise<LoginResult> {
    const tokenId = uuidv4();

    const refreshToken = await this.refreshTokenService.create(
      tokenId,
      booking?.customer_email,
      booking?.customer_id,
      platform,
    );

    return this.authService.generateTokenInfo(
      booking?.customer_id,
      [UserRoles.CUSTOMER],
      refreshToken,
      tokenId,
    );
  }

  @ResolveField('site_features')
  async site_features(@Parent() booking: Booking): Promise<PlatformFeature[]> {
    if (booking?.site_features) {
      return booking?.site_features;
    }
    return await this.bookingSiteFeatureService.getByBookingId(booking?.id);
  }

  @ResolveField('space_features')
  async space_features(@Parent() booking: Booking): Promise<PlatformFeature[]> {
    if (booking?.space_features) {
      return booking?.space_features;
    }
    return await this.bookingSpaceFeatureService.getByBookingId(booking?.id);
  }

  @ResolveField('history')
  async history(@Parent() booking: Booking): Promise<BookingHistory[]> {
    if (booking?.history) {
      return booking?.history;
    }
    return await this.bookingHistoryService.getByBookingId(booking?.id);
  }

  @ResolveField('customer')
  async customer(@Parent() booking: IBookingEntity): Promise<User> {
    return await this.userService.findOne(booking?.customer_id);
  }

  @ResolveField('original_site')
  async site(@Parent() booking: IBookingEntity): Promise<User> {
    return await this.siteService.getById(booking?.site_id);
  }

  @ResolveField('original_space')
  async space(@Parent() booking: IBookingEntity): Promise<Space> {
    return await this.spaceService.getById(booking?.space_id);
  }

  @ResolveField('termination')
  async termination(@Parent() booking: IBookingEntity): Promise<Termination> {
    return await this.terminationService.getByBookingId(booking?.id);
  }

  @ResolveField('payment_schedule')
  async paymentSchedule(
    @Parent() booking: IBookingEntity,
  ): Promise<PaymentScheduleResp[]> {
    return await this.renewalService.paymentSchedule(booking?.id);
  }

  @ResolveField('applied_taxes')
  async appliedTaxes(@Parent() booking: IBookingEntity): Promise<AppliedTax[]> {
    return await this.appliedTaxService.getByBookingId(booking?.id);
  }
}
