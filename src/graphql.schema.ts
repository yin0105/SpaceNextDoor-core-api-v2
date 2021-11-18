
/** ------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */
export enum LoginProvider {
    FACEBOOK = "FACEBOOK",
    GOOGLE = "GOOGLE"
}

export enum LoginTokenType {
    BEARER = "BEARER"
}

export enum BookingStatus {
    RESERVED = "RESERVED",
    CONFIRMED = "CONFIRMED",
    ACTIVE = "ACTIVE",
    TERMINATED = "TERMINATED",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}

export enum PriceChangeStatus {
    PRICE_CHANGED = "PRICE_CHANGED",
    BOOKING_NOT_FOUND = "BOOKING_NOT_FOUND",
    NO_PRICE_CHANGE = "NO_PRICE_CHANGE",
    INVALID_PRICE = "INVALID_PRICE"
}

export enum PromotionForType {
    FIRST_MONTHS = "FIRST_MONTHS",
    LAST_MONTHS = "LAST_MONTHS",
    RENEWAL_INDEX = "RENEWAL_INDEX"
}

export enum RenewalStatus {
    PAID = "PAID",
    UN_PAID = "UN_PAID",
    FAILED = "FAILED"
}

export enum RenewalType {
    BOOKING = "BOOKING",
    FULL_SUBSCRIPTION = "FULL_SUBSCRIPTION",
    PARTIAL_SUBSCRIPTION = "PARTIAL_SUBSCRIPTION"
}

export enum ReviewStatus {
    SCHEDULED = "SCHEDULED",
    REMINDED = "REMINDED",
    REVIEWED = "REVIEWED"
}

export enum TransactionType {
    BOOKING = "BOOKING",
    ORDER = "ORDER",
    BOOKING_ORDER = "BOOKING_ORDER",
    TERMINATION = "TERMINATION",
    RENEWAL = "RENEWAL",
    REFUND_CANCEL_BOOKING = "REFUND_CANCEL_BOOKING",
    REFUND_DEPOSIT = "REFUND_DEPOSIT",
    REFUND_UNUSED_DAYS = "REFUND_UNUSED_DAYS"
}

export enum FixedCountry {
    Singapore = "Singapore",
    Thailand = "Thailand",
    Japan = "Japan",
    Korea = "Korea"
}

export enum VehicleType {
    VAN = "VAN",
    LORRY10 = "LORRY10",
    LORRY14 = "LORRY14",
    LORRY24 = "LORRY24"
}

export enum NotificationType {
    EMAIL = "EMAIL",
    SMS = "SMS"
}

export enum OrderStatus {
    PENDING = "PENDING",
    CONFIRMED = "CONFIRMED",
    ACTIVE = "ACTIVE",
    CANCELLED = "CANCELLED",
    COMPLETED = "COMPLETED"
}

export enum PayoutStatus {
    PENDING = "PENDING",
    PAID = "PAID"
}

export enum PlatformFeatureType {
    SITE = "SITE",
    SPACE = "SPACE",
    SPACE_TYPE = "SPACE_TYPE"
}

export enum PolicyType {
    CANCELLATION = "CANCELLATION",
    RENEWAL = "RENEWAL"
}

export enum ServiceType {
    PICK_UP = "PICK_UP"
}

export enum ServiceStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE"
}

export enum ServiceFrequency {
    RECURRING = "RECURRING",
    ONE_TIME = "ONE_TIME"
}

export enum SpaceCategoryItemSizeUnit {
    cm = "cm"
}

export enum SpaceSizeUnit {
    sqft = "sqft",
    sqm = "sqm",
    tatami = "tatami"
}

export enum TaxType {
    PERCENTAGE = "PERCENTAGE",
    ABSOLUTE = "ABSOLUTE"
}

export enum TaxEntityType {
    SITE = "SITE",
    SERVICE = "SERVICE",
    INSURANCE = "INSURANCE"
}

export enum PromotionBuyTypes {
    MIN_DAYS = "MIN_DAYS",
    MIN_PRICE = "MIN_PRICE"
}

export enum PromotionType {
    TOTAL_AMOUNT = "TOTAL_AMOUNT",
    PERCENTAGE_DISCOUNT = "PERCENTAGE_DISCOUNT",
    FIXED_AMOUNT_DISCOUNT = "FIXED_AMOUNT_DISCOUNT"
}

export enum PromotionFormat {
    PUBLIC = "PUBLIC",
    VOUCHER = "VOUCHER",
    CODE = "CODE"
}

export enum PromotionStatus {
    DRAFT = "DRAFT",
    ACTIVE = "ACTIVE",
    FINISH = "FINISH",
    IN_ACTIVE = "IN_ACTIVE"
}

export enum QuotationStatus {
    ACCEPTED = "ACCEPTED",
    REJECTED = "REJECTED",
    ACTIVE = "ACTIVE"
}

export enum RefundType {
    REFUND_CANCEL_BOOKING = "REFUND_CANCEL_BOOKING",
    REFUND_DEPOSIT = "REFUND_DEPOSIT",
    REFUND_UNUSED_DAYS = "REFUND_UNUSED_DAYS"
}

export enum SortBy {
    asc = "asc",
    desc = "desc"
}

export enum DoorActionType {
    OPEN = "OPEN",
    CLOSE = "CLOSE"
}

export enum ProviderType {
    BUSINESS = "BUSINESS",
    INDIVIDUAL = "INDIVIDUAL"
}

export enum SiteStatus {
    DRAFT = "DRAFT",
    REJECTED = "REJECTED",
    READY_TO_REVIEW = "READY_TO_REVIEW",
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE"
}

export enum StockManagementType {
    THIRD_PARTY = "THIRD_PARTY",
    SND = "SND",
    AFFILIATE = "AFFILIATE"
}

export enum PriceType {
    BASE_PRICE = "BASE_PRICE",
    DISCOUNTED_PRICE = "DISCOUNTED_PRICE"
}

export enum SpaceStatus {
    ACTIVE = "ACTIVE",
    IN_ACTIVE = "IN_ACTIVE",
    ARCHIVED = "ARCHIVED",
    REJECTED = "REJECTED",
    READY_TO_REVIEW = "READY_TO_REVIEW",
    DRAFT = "DRAFT"
}

export enum TerminationStatus {
    REQUESTED = "REQUESTED",
    ON_HOLD = "ON_HOLD",
    SCHEDULED = "SCHEDULED",
    TERMINATED = "TERMINATED"
}

export enum TerminationPaymentStatus {
    PENDING = "PENDING",
    PAID = "PAID",
    FAILED = "FAILED"
}

export class RefreshTokenPayload {
    refresh_token: string;
    access_token: string;
}

export class LoginWithSocialPayload {
    type: LoginProvider;
    token: string;
    preferred_language?: string;
}

export class LoginPayload {
    username: string;
    otp: string;
    preferred_language?: string;
}

export class LoginAdminAsUserPayload {
    user_id: number;
}

export class SendOTPPayload {
    username: string;
}

export class ProviderUpdateBankPayload {
    bank_id: number;
    bank_account_number: string;
    bank_account_holder_name?: string;
}

export class UpdateProfilePayload {
    first_name?: string;
    last_name?: string;
    email?: string;
    customer_card_token?: string;
    preferred_language?: string;
    provider_bank?: ProviderUpdateBankPayload;
}

export class BookingSiteAddressPayload {
    lat: number;
    lng: number;
    country_id: number;
    city_id: number;
    district_id: number;
    street: string;
    flat?: string;
    postal_code: string;
}

export class PriceUpdateItem {
    booking_id: string;
    price: number;
}

export class PriceUpdatePayload {
    data: PriceUpdateItem[];
    review_mode?: boolean;
}

export class BookingPayload {
    name: string;
    phone_number: string;
    email: string;
    auto_renewal: boolean;
    site_id: number;
    space_id: number;
    preferred_language?: string;
    move_in_date: Date;
    move_out_date?: Date;
    promo_code?: string;
    promotion_id?: number;
    quotation_item_id?: number;
}

export class CancelBookingPayload {
    booking_id: number;
    cancellation_reason_id: number;
    cancellation_note?: string;
}

export class UpdateBookingPayload {
    status?: BookingStatus;
    insurance_id?: number;
}

export class BookingFilter {
    id: BookingIdFilter;
}

export class UpdateBookingFilter {
    id: BookingIdFilter;
}

export class BookingsFilter {
    status?: BookingStatusFilter;
    base_amount?: BookingBaseAmountFilter;
    move_in_date?: MoveInDateFilter;
    move_out_date?: MoveOutDateFilter;
}

export class MoveInDateFilter {
    _gt?: Date;
    _lt?: Date;
}

export class MoveOutDateFilter {
    _gt?: Date;
    _lt?: Date;
}

export class BookingBaseAmountFilter {
    _gt?: number;
    _lt?: number;
}

export class BookingStatusFilter {
    _eq?: BookingStatus;
    _in?: BookingStatus[];
}

export class BookingIdFilter {
    _eq?: number;
}

export class PayBookingPayload {
    token?: string;
    booking_id: number;
}

export class CheckOutPricePayload {
    move_in_date: Date;
    move_out_date?: Date;
    space_id: number;
    insurance_id?: number;
    pick_up_service_id?: number;
    pickup_service_details?: PickupServiceDetailsCheckoutPricePayload;
    promo_code?: string;
    promotion_id?: number;
    quotation_item_id?: number;
}

export class CheckoutLogisticsPickUpLocation {
    lat: number;
    lng: number;
}

export class PickupServiceDetailsCheckoutPricePayload {
    schedule_at: Date;
    pick_up_location: CheckoutLogisticsPickUpLocation;
    additional_requirements?: LogisticsPriceAdditionalRequirements;
}

export class ChangeBookingUnitPayload {
    short_id: string;
    new_space_id: number;
    apply_immidiately: boolean;
    apply: boolean;
}

export class AddPromotionsToBookingPayload {
    short_id: string;
    promo_code?: string;
    promotion_id?: number;
    apply: boolean;
}

export class CustomerGetsInput {
    id?: number;
    type: PromotionType;
    value: number;
    for_type: PromotionForType;
    for_value: number;
    max_amount_per_booking?: number;
}

export class PaymentSchedulePayload {
    move_in_date: Date;
    move_out_date?: Date;
    space_id: number;
    insurance_id?: number;
    pick_up_service_id?: number;
    promo_code?: string;
    promotion_id?: number;
    quotation_item_id?: number;
}

export class TransactionIdFilter {
    _eq?: number;
    _in?: number[];
}

export class TransactionTypeFilter {
    _eq?: TransactionType;
    _in?: TransactionType[];
}

export class TransactionsIdFilter {
    id: TransactionIdFilter;
}

export class TransactionsFilter {
    id?: TransactionIdFilter;
    from_date?: FromDateFilter;
    to_date?: ToDateFilter;
    booking_id?: TransactionIdFilter;
    type?: TransactionTypeFilter;
}

export class LocationsSort {
    name?: SortBy;
}

export class CountryFilter {
    _eq: FixedCountry;
}

export class CountriesFilter {
    country: CountryFilter;
}

export class LocationFilter {
    country: CountryFilter;
    name?: StringFilter;
}

export class CustomerInvoiceFilter {
    transaction_id?: TransactionIdFilter;
}

export class LogisticsPricePayload {
    space_id: number;
    service_id: number;
    schedule_at: Date;
    pick_up: LogisticsPickUpLocation;
    additional_requirements?: LogisticsPriceAdditionalRequirements;
}

export class LogisticsPriceAdditionalRequirements {
    mover_count?: number;
}

export class LogisticsPickUpLocation {
    lat: number;
    lng: number;
}

export class SendNotificationPayload {
    type: NotificationType;
    sms_text?: string;
    template_id?: string;
    template_body?: JSON;
    email_custom_message?: string;
    email_subject?: string;
}

export class UsernameFilter {
    _eq?: string;
    _in?: string[];
}

export class SendNotificationFilter {
    username: UsernameFilter;
}

export class PickUpServiceDetails {
    address: string;
    lat: number;
    lng: number;
    pickup_time: Date;
    service_id: number;
    additional_requirements?: LogisticsPriceAdditionalRequirements;
}

export class OrderPayload {
    booking_id: number;
    pickup_service_details: PickUpServiceDetails;
}

export class PayOrderPayload {
    order_id: number;
}

export class CancelOrderPayload {
    order_id: number;
}

export class UpdatePayoutPayload {
    status: PayoutStatus;
}

export class UpdatePayoutFilter {
    id: PayoutIdFilter;
}

export class PayoutIdFilter {
    _eq: number;
}

export class PlatformBankIdFilter {
    _eq: number;
}

export class PlatformBankIsActiveFilter {
    _eq: boolean;
}

export class BanksFilter {
    country_id?: PlatformBankIdFilter;
    is_active?: PlatformBankIsActiveFilter;
}

export class BanksSort {
    name?: SortBy;
}

export class FeatureCategorySort {
    name_en?: SortBy;
    name_th?: SortBy;
    name_jp?: SortBy;
    name_kr?: SortBy;
}

export class PlatformFeatureTypeFilter {
    _eq?: PlatformFeatureType;
    _in?: PlatformFeatureType[];
}

export class PlatformFeatureIsActiveFilter {
    _eq: boolean;
}

export class FeatureCategoryFilter {
    type?: PlatformFeatureTypeFilter;
    is_active?: PlatformFeatureIsActiveFilter;
}

export class InsuranceSort {
    covered_amount?: SortBy;
}

export class InsuranceFilter {
    country?: CountryFilter;
    country_id?: EntityIdFilter;
}

export class PropertyTypeSort {
    name_en?: SortBy;
    name_th?: SortBy;
    name_jp?: SortBy;
    name_kr?: SortBy;
}

export class ServiceStatusFilter {
    _eq?: ServiceStatus;
    _in?: ServiceStatus[];
}

export class ServiceFilter {
    country?: CountryFilter;
    status?: ServiceStatusFilter;
    country_id?: EntityIdFilter;
}

export class SpaceTypeSizeFilter {
    _eq?: number;
}

export class SpaceTypeSizeUnitFilter {
    _eq?: SpaceSizeUnit;
}

export class DistrictIdFilter {
    _in?: number[];
}

export class SpaceTypesFilter {
    size?: SpaceTypeSizeFilter;
    country?: CountryFilter;
    unit?: SpaceTypeSizeUnitFilter;
}

export class SpacesByTypeFilter {
    district_ids?: DistrictIdFilter;
    site_id?: EntityIdFilter;
}

export class CustomerBuysInput {
    type: PromotionBuyTypes;
    value: number;
    site_ids?: number[];
    country_id?: number;
}

export class PromotionInput {
    name_en: string;
    name_th: string;
    name_jp: string;
    name_kr: string;
    description_en?: string;
    description_th?: string;
    description_jp?: string;
    description_kr?: string;
    format: PromotionFormat;
    status?: PromotionStatus;
    code?: string;
    start_date: Date;
    end_date: Date;
    max?: number;
    max_per_day?: number;
    max_per_customer?: number;
    customer_buys?: CustomerBuysInput;
    customer_gets?: CustomerGetsInput[];
}

export class ApplyPromotionInput {
    code: string;
    space_id: number;
    move_in_date: Date;
    move_out_date?: Date;
}

export class PromotionIntFilter {
    _eq?: number;
}

export class PromotionFormatFilter {
    _eq?: PromotionFormat;
}

export class PromotionStatusFilter {
    _eq?: PromotionStatus;
}

export class PromotionFilter {
    id?: PromotionIntFilter;
}

export class PromotionsFilter {
    id?: PromotionIntFilter;
    format?: PromotionFormatFilter;
    status?: PromotionStatusFilter;
    site_id?: PromotionIntFilter;
}

export class PromotionsSort {
    name?: SortBy;
    created_at?: SortBy;
}

export class QuotationIdFilter {
    _eq?: string;
}

export class QuotationPayload {
    move_in_date: Date;
    move_out_date?: Date;
    first_name: string;
    last_name: string;
    phone_number: string;
    email: string;
    preferred_language: string;
    promo_code?: string;
    promotion_id?: number;
    site_id?: number;
    space_id?: number;
    district_ids?: number[];
    space_type_id?: number;
}

export class CreateReviewPayload {
    booking_id: number;
    content: string;
    title: string;
    rating: number;
}

export class ReviewsIntFilter {
    _eq?: number;
}

export class ReviewsWhereFilterInput {
    rating?: ReviewsIntFilter;
    site_id?: ReviewsIntFilter;
}

export class ReviewsPaginationInput {
    page: number;
    limit: number;
}

export class Pagination {
    limit: number;
    skip: number;
}

export class NumberOperators {
    _eq?: number;
    _lt?: number;
    _lte?: number;
    _gt?: number;
    _gte?: number;
    _in?: number[];
}

export class StringOperators {
    _eq?: string;
    _contains?: string;
}

export class IdFilter {
    _eq?: number;
    _in?: number[];
}

export class FromDateFilter {
    _gt?: Date;
    _lt?: Date;
}

export class ToDateFilter {
    _gt?: Date;
    _lt?: Date;
}

export class SiteAddressPayload {
    lat: number;
    lng: number;
    country_id: number;
    city_id: number;
    district_id: number;
    street: string;
    flat?: string;
    postal_code: string;
}

export class OpenDoorIdFilter {
    _eq: number;
}

export class OpenDoorStrFilter {
    _eq: string;
}

export class SiteDoorsFilter {
    booking_id: IdFilter;
}

export class SiteDoorsSort {
    name?: SortBy;
}

export class OpenSiteDoorWhere {
    door_id: OpenDoorStrFilter;
    provider_id: OpenDoorStrFilter;
    booking_id?: OpenDoorIdFilter;
}

export class SitePayload {
    name?: string;
    description?: string;
    property_type_id: number;
    rules_id: number[];
    features_id: number[];
    policies_id: number[];
    floor?: number;
    provider_type: ProviderType;
    address?: SiteAddressPayload;
}

export class UpdateSitePayload {
    name?: string;
    description?: string;
    property_type_id?: number;
    rules_id?: number[];
    features_id?: number[];
    policies_id?: number[];
    floor?: number;
    provider_type?: ProviderType;
    address?: SiteAddressPayload;
    status?: SiteStatus;
    images?: string[];
}

export class EntityIdFilter {
    _eq?: number;
    _in?: number[];
}

export class UpdateSiteFilter {
    id: EntityIdFilter;
}

export class StringFilter {
    _eq?: string;
    _like?: string;
    _iLike?: string;
}

export class SiteStatusFilter {
    _eq?: SiteStatus;
    _in?: SiteStatus[];
}

export class StockManagementFilter {
    _eq?: StockManagementType;
    _in?: StockManagementType[];
}

export class PriceFilter {
    _eq?: number;
    _gt?: number;
    _gte?: number;
    _lt?: number;
    _lte?: number;
}

export class NumberFilter {
    _eq?: number;
}

export class SiteLocationFilter {
    distance: NumberFilter;
    longitude: NumberFilter;
    latitude: NumberFilter;
}

export class SitesFilter {
    id?: EntityIdFilter;
    platform_space_type_id?: EntityIdFilter;
    site_platform_feature_id?: EntityIdFilter;
    space_platform_feature_id?: EntityIdFilter;
    price?: PriceFilter;
    name?: StringFilter;
    status?: SiteStatusFilter;
    stock_management_type?: StockManagementFilter;
    country_id?: EntityIdFilter;
    country?: CountryFilter;
    city_id?: EntityIdFilter;
    district_id?: EntityIdFilter;
    is_featured?: boolean;
    location?: SiteLocationFilter;
    quotation_id?: QuotationIdFilter;
}

export class SiteMoveInDateFilter {
    _eq?: Date;
}

export class SiteMoveOutDateFilter {
    _eq?: Date;
}

export class AvailableUnitsFilter {
    _gt?: number;
}

export class SitesSort {
    name?: SortBy;
    created_at?: SortBy;
}

export class SitesSpacesFilter {
    id?: EntityIdFilter;
    type_id?: EntityIdFilter;
    feature_id?: EntityIdFilter;
    available_units?: AvailableUnitsFilter;
    status?: SiteStatusFilter;
    price?: PriceFilter;
    move_in_date?: SiteMoveInDateFilter;
    move_out_date?: SiteMoveOutDateFilter;
}

export class SitesSpacesSort {
    price?: SortBy;
    size?: SortBy;
}

export class SpacePayload {
    name?: string;
    height: number;
    width: number;
    length: number;
    size_unit: SpaceSizeUnit;
    price_per_month: number;
    total_units: number;
    site_id: number;
    features_id: number[];
}

export class UpdateSpacePayload {
    name?: string;
    height?: number;
    width?: number;
    length?: number;
    size_unit?: SpaceSizeUnit;
    price_per_month?: number;
    total_units?: number;
    images?: string[];
    features_id?: number[];
}

export class SpaceMoveInDateFilter {
    _eq?: Date;
}

export class SpaceMoveOutDateFilter {
    _eq?: Date;
}

export class SpaceIdFilter {
    _eq: number;
}

export class SpaceStatusFilter {
    _eq?: SpaceStatus;
}

export class UpdateSpaceFilter {
    id: SpaceIdFilter;
}

export class SpaceFilter {
    id: SpaceIdFilter;
}

export class SpacesSort {
    price?: SortBy;
}

export class SpacesFilter {
    id?: SpaceIdFilter;
    site_id?: SpaceIdFilter;
    status?: SpaceStatusFilter;
    available_units?: AvailableUnitsFilter;
    country?: CountryFilter;
    quotation_uuid?: string;
    type_id?: SpaceIdFilter;
    move_in_date?: SpaceMoveInDateFilter;
    move_out_date?: SpaceMoveOutDateFilter;
}

export class DeleteSpaceFilter {
    id?: SpaceIdFilter;
}

export class TerminationPayload {
    move_out_date: Date;
    booking_id: number;
}

export class PayTerminationPayload {
    termination_id: number;
}

export class AppliedTax {
    id: number;
    name_en: string;
    name_th?: string;
    name_jp?: string;
    name_kr?: string;
    type: TaxType;
    value: number;
    tax: PlatformTax;
    tax_amount: number;
    country: Country;
    city?: City;
    is_default: boolean;
    entity_type: TaxEntityType;
}

export abstract class IMutation {
    abstract sendOTP(payload: SendOTPPayload): SendOTPResult | Promise<SendOTPResult>;

    abstract login(payload: LoginPayload): LoginResult | Promise<LoginResult>;

    abstract refreshToken(payload: RefreshTokenPayload): LoginResult | Promise<LoginResult>;

    abstract loginAdminAsUser(payload: LoginAdminAsUserPayload): LoginResult | Promise<LoginResult>;

    abstract loginWithSocial(payload: LoginWithSocialPayload): LoginResult | Promise<LoginResult>;

    abstract updateProfile(payload: UpdateProfilePayload): UpdateProfileResp | Promise<UpdateProfileResp>;

    abstract createBooking(payload: BookingPayload): Booking | Promise<Booking>;

    abstract updateBooking(payload: UpdateBookingPayload, where: UpdateBookingFilter): UpdateBookingResp | Promise<UpdateBookingResp>;

    abstract updateBookingPrice(payload: PriceUpdatePayload): PriceUpdateResp | Promise<PriceUpdateResp>;

    abstract payBooking(payload: PayBookingPayload): PayBookingResp | Promise<PayBookingResp>;

    abstract cancelBooking(payload: CancelBookingPayload): CancelBookingResponse | Promise<CancelBookingResponse>;

    abstract calculateCheckOutPrice(payload: CheckOutPricePayload): CheckOutPriceResp | Promise<CheckOutPriceResp>;

    abstract changeBookingUnit(payload: ChangeBookingUnitPayload): ChangeBookingUnitResp | Promise<ChangeBookingUnitResp>;

    abstract addPromotionsToBooking(payload: AddPromotionsToBookingPayload): AddPromotionsToBookingResp | Promise<AddPromotionsToBookingResp>;

    abstract paymentSchedule(payload: PaymentSchedulePayload): PaymentScheduleResp[] | Promise<PaymentScheduleResp[]>;

    abstract calculateLogisticsPrice(payload: LogisticsPricePayload): LogisticsPriceResp | Promise<LogisticsPriceResp>;

    abstract sendNotification(payload: SendNotificationPayload, where: SendNotificationFilter): NotificationResult | Promise<NotificationResult>;

    abstract createOrder(payload: OrderPayload): Order | Promise<Order>;

    abstract payOrder(payload: PayOrderPayload): PayOrderResp | Promise<PayOrderResp>;

    abstract cancelOrder(payload: CancelOrderPayload): CancelOrderResp | Promise<CancelOrderResp>;

    abstract updatePayout(payload: UpdatePayoutPayload, where: UpdatePayoutFilter): UpdatePayoutResp | Promise<UpdatePayoutResp>;

    abstract createPromotion(payload: PromotionInput): Promotion | Promise<Promotion>;

    abstract updatePromotion(payload: PromotionInput, where: PromotionFilter): Promotion | Promise<Promotion>;

    abstract applyPromotion(payload: ApplyPromotionInput): ApplyPromotionResponse | Promise<ApplyPromotionResponse>;

    abstract createQuotation(payload: QuotationPayload): QuotationResp | Promise<QuotationResp>;

    abstract createReview(payload: CreateReviewPayload): boolean | Promise<boolean>;

    abstract openSiteDoor(where: OpenSiteDoorWhere): OpenSiteDoorResp | Promise<OpenSiteDoorResp>;

    abstract createSite(payload: SitePayload): Site | Promise<Site>;

    abstract updateSite(payload: UpdateSitePayload, where: UpdateSiteFilter): UpdateSiteResp | Promise<UpdateSiteResp>;

    abstract createSpace(payload: SpacePayload): Space | Promise<Space>;

    abstract updateSpace(payload: UpdateSpacePayload, where: UpdateSpaceFilter): UpdateSpaceResp | Promise<UpdateSpaceResp>;

    abstract deleteSpace(where: DeleteSpaceFilter): DeleteSpaceResp | Promise<DeleteSpaceResp>;

    abstract calculateTerminationDues(payload: TerminationPayload): CalculateTerminationDuesResp | Promise<CalculateTerminationDuesResp>;

    abstract requestTermination(payload: TerminationPayload): Termination | Promise<Termination>;

    abstract payTerminationAmount(payload: PayTerminationPayload): PayTerminationResp | Promise<PayTerminationResp>;
}

export class SendOTPResult {
    isSent: boolean;
}

export class LoginResult {
    access_token: string;
    refresh_token: string;
    token_type: LoginTokenType;
    expires_at: string;
}

export class Customer {
    id: number;
    stripe_customer_id?: string;
    card_last_digits?: string;
    card_brand_name?: string;
    card_holder_name?: string;
    updated_by: number;
    created_at: Date;
    updated_at: Date;
}

export class Provider {
    id: number;
    tax_id?: string;
    bank_account_number?: string;
    bank_account_holder_name?: string;
    bank?: PlatformBank;
    updated_by: number;
    created_at: Date;
    updated_at: Date;
}

export class User {
    id: number;
    customer_id?: number;
    provider_id?: number;
    first_name?: string;
    last_name?: string;
    email?: string;
    stripe_customer_id?: string;
    phone_number?: string;
    image_url?: string;
    preferred_language?: string;
    is_email_verified?: boolean;
    is_phone_verified?: boolean;
    facebook_user_id?: string;
    google_user_id?: string;
    provider?: Provider;
    customer?: Customer;
    created_at: Date;
    updated_at: Date;
}

export class UpdateProfileResp {
    edges: User[];
    modified: number;
}

export abstract class IQuery {
    abstract profile(): User | Promise<User>;

    abstract booking(where: BookingFilter): Booking | Promise<Booking>;

    abstract bookings(pagination: Pagination, where?: BookingsFilter): BookingsResp | Promise<BookingsResp>;

    abstract cancellation_reasons(): BookingCancellationReasonsResp | Promise<BookingCancellationReasonsResp>;

    abstract transactions(pagination: Pagination, where?: TransactionsFilter): TransactionsResp | Promise<TransactionsResp>;

    abstract countries(pagination: Pagination, where?: CountriesFilter): CountriesResp | Promise<CountriesResp>;

    abstract locations(where?: LocationFilter, sort_by?: LocationsSort): LocationsResp | Promise<LocationsResp>;

    abstract customer_invoice(where: CustomerInvoiceFilter): CustomerInvoice | Promise<CustomerInvoice>;

    abstract banks(pagination: Pagination, where?: BanksFilter, sort_by?: BanksSort): BanksResp | Promise<BanksResp>;

    abstract feature_categories(pagination: Pagination, where?: FeatureCategoryFilter, sort_by?: FeatureCategorySort): FeatureCategoryResp | Promise<FeatureCategoryResp>;

    abstract insurances(pagination: Pagination, sort_by?: InsuranceSort, where?: InsuranceFilter): InsurancesResp | Promise<InsurancesResp>;

    abstract property_types(pagination: Pagination, sort_by?: PropertyTypeSort): PropertyTypeResp | Promise<PropertyTypeResp>;

    abstract services(pagination: Pagination, where?: ServiceFilter): ServicesResp | Promise<ServicesResp>;

    abstract space_categories(pagination: Pagination): PlatformSpaceCategoryResp | Promise<PlatformSpaceCategoryResp>;

    abstract space_types(pagination: Pagination, where?: SpaceTypesFilter): PlatformSpaceTypeResp | Promise<PlatformSpaceTypeResp>;

    abstract promotions(pagination: Pagination, where?: PromotionsFilter, sort_by?: PromotionsSort): PromotionsResp | Promise<PromotionsResp>;

    abstract reviews(pagination: ReviewsPaginationInput, where?: ReviewsWhereFilterInput): ReviewsResp | Promise<ReviewsResp>;

    abstract site_doors(pagination: Pagination, where: SiteDoorsFilter, sort_by?: SiteDoorsSort): SiteDoorsResp | Promise<SiteDoorsResp>;

    abstract sites(pagination: Pagination, where?: SitesFilter, sort_by?: SitesSort): SitesResp | Promise<SitesResp>;

    abstract space(where: SpaceFilter): Space | Promise<Space>;

    abstract spaces(pagination: Pagination, where: SpacesFilter, sort_by?: SpacesSort): SpacesResp | Promise<SpacesResp>;
}

export class BookingHistory {
    id: number;
    status: string;
    note: string;
    created_at: Date;
    updated_at: Date;
    old_base_amount?: number;
    old_deposit?: number;
    new_deposit?: number;
    base_amount?: number;
    old_insurance_id?: number;
    insurance_id?: number;
    old_space_id?: number;
    new_space_id?: number;
    promotion_id?: number;
    public_promotion_id?: number;
}

export class BookingSiteAddress {
    id: number;
    lat: number;
    lng: number;
    country?: Country;
    city?: City;
    district?: District;
    postal_code: string;
    street: string;
    flat?: string;
    created_at: Date;
    updated_at: Date;
}

export class Booking {
    id: number;
    auto_renewal: boolean;
    move_in_date: Date;
    move_out_date?: Date;
    customer_phone_number?: string;
    short_id: string;
    commitment_months?: number;
    space_size_unit?: SpaceSizeUnit;
    space_size?: number;
    space_height?: number;
    space_width?: number;
    space_length?: number;
    insurance?: PlatformInsurance;
    is_insured: boolean;
    is_reviewed: boolean;
    review_status?: ReviewStatus;
    insurance_amount?: number;
    space_price_per_month: number;
    currency: string;
    orders: Order[];
    deposited_amount: number;
    is_deposit_refunded: boolean;
    deposit_refunded_date?: Date;
    status: BookingStatus;
    currency_sign: string;
    site_name: string;
    unit_id?: string;
    site_description: string;
    original_site?: Site;
    original_space?: Space;
    base_amount: number;
    original_base_amount: number;
    auth: LoginResult;
    total_tax_amount: number;
    total_amount: number;
    discount_amount: number;
    cancellation?: BookingCancellation;
    sub_total_amount: number;
    customer: User;
    transactions: Transaction[];
    renewals: Renewal[];
    site_address: BookingSiteAddress;
    site_features: PlatformFeature[];
    space_features: PlatformFeature[];
    history: BookingHistory[];
    termination?: Termination;
    is_termination_requested?: boolean;
    payment_schedule?: PaymentScheduleResp[];
    applied_taxes?: AppliedTax[];
    created_at: Date;
    updated_at: Date;
    quotation_item?: QuotationItem;
}

export class BookingCancellation {
    id: number;
    refunded_amount: number;
    refund_date?: Date;
    penalty_percent: number;
    cancellation_reason?: BookingCancellationReason;
    cancellation_note?: string;
}

export class BookingPriceChange {
    id?: number;
    booking_id: string;
    fromPrice?: number;
    toPrice?: number;
    status: PriceChangeStatus;
}

export class BookingsResp {
    page_info: PageInfo;
    edges: Booking[];
}

export class UpdateBookingResp {
    edges: Booking[];
    modified: number;
}

export class PriceUpdateResp {
    edges: BookingPriceChange[];
    modified?: number;
}

export class PayBookingResp {
    success: boolean;
}

export class CheckoutAppliedTax {
    id: number;
    name_en: string;
    name_th?: string;
    name_jp?: string;
    name_kr?: string;
    type: TaxType;
    value: number;
    entity_type: TaxEntityType;
    amount: number;
}

export class CheckOutPriceResp {
    insurance_price?: number;
    sub_total_amount?: number;
    service_price?: number;
    deposit_amount?: number;
    payable_amount: number;
    applied_promotion?: Promotion;
    public_promotion?: Promotion;
    discounted_amount?: number;
    promotion_error?: string;
    currency_sign?: string;
    total_tax: number;
    applied_taxes: CheckoutAppliedTax[];
}

export class BookingCancellationReason {
    id: number;
    description_en?: string;
    description_th?: string;
    description_kr?: string;
    description_jp?: string;
}

export class BookingCancellationReasonsResp {
    edges: BookingCancellationReason[];
}

export class CancelBookingResponse {
    id: number;
    refunded_amount: number;
    penalty_applied: boolean;
    penalty_percent: number;
}

export class ChangeBookingUnitResp {
    is_changed: boolean;
    deposit_refunded_amount: number;
    deposit_charged_amount: number;
    refunded_unused_days: number;
    charged_unused_days: number;
    message: string;
    details?: JSON;
}

export class AddPromotionsToBookingResp {
    is_applied: boolean;
    message: string;
    details?: JSON;
}

export class CustomerGets {
    id: number;
    type: PromotionType;
    value: number;
    for_type: PromotionForType;
    for_value: number;
    max_amount_per_booking?: number;
}

export class Renewal {
    id: number;
    type: RenewalType;
    status: RenewalStatus;
    next_renewal_date?: Date;
    renewal_start_date: Date;
    renewal_end_date: Date;
    renewal_paid_date?: Date;
    last_attempt_date?: Date;
    base_amount: number;
    deposit_amount?: number;
    insurance_amount?: number;
    total_amount: number;
    discount_amount: number;
    sub_total_amount: number;
    total_tax_amount: number;
    next_renewal_sub_total?: number;
    next_renewal_total?: number;
    next_renewal_discount?: number;
    booking: Booking;
    created_at: Date;
    updated_at: Date;
}

export class PaymentScheduleResp {
    from_date: Date;
    to_date: Date;
    total_amount: number;
    insurance_price?: number;
    sub_total_amount?: number;
    service_price?: number;
    deposit_amount?: number;
    applied_promotion?: Promotion;
    discounted_amount?: number;
    currency_sign?: string;
}

export class TransactionInsurance {
    id: number;
    name_en: string;
    name_th: string;
    name_jp: string;
    name_kr: string;
    covered_amount: number;
    price_per_day: number;
    third_party_provider: string;
    total_amount: number;
    created_at: Date;
    updated_at: Date;
}

export class Transaction {
    id: number;
    short_id?: string;
    invoice_id?: string;
    card_last_digits: string;
    card_brand_name?: string;
    amount: number;
    currency: string;
    created_at: Date;
    updated_at: Date;
    type: TransactionType;
    renewal?: Renewal;
    booking?: Booking;
    insurance?: TransactionInsurance;
    order_pick_up_service?: OrderPickUpService;
    stripe_charge_id?: string;
}

export class TransactionsResp {
    page_info: PageInfo;
    edges: Transaction[];
}

export class Country {
    id: number;
    name_en: string;
    name_th: string;
    name_jp: string;
    name_kr: string;
    code: string;
    currency: string;
    currency_sign: string;
    cities: City[];
}

export class City {
    id: number;
    name_en: string;
    name_th: string;
    name_jp: string;
    name_kr: string;
    districts: District[];
}

export class LocationCountry {
    id: number;
    name_en: string;
    name_th: string;
    name_jp: string;
    name_kr: string;
}

export class LocationCity {
    id: number;
    name_en: string;
    name_th: string;
    name_jp: string;
    name_kr: string;
}

export class District {
    id: number;
    name_en: string;
    name_th: string;
    name_jp: string;
    name_kr: string;
}

export class LocationLandmark {
    id: number;
    name_en: string;
    name_th: string;
    name_jp: string;
    name_kr: string;
}

export class Location {
    country: LocationCountry;
    city: LocationCity;
    district?: District;
    landmark?: LocationLandmark;
}

export class CountriesResp {
    page_info: PageInfo;
    edges: Country[];
}

export class LocationsResp {
    edges: Location[];
}

export class EntityTax {
    id: number;
    tax: PlatformTax;
    site?: Site;
    service?: PlatformService;
    insurance?: PlatformInsurance;
    created_at: Date;
    updated_at: Date;
}

export class CustomerInvoice {
    start_date?: Date;
    end_date?: Date;
    issue_date?: Date;
    transaction_short_id?: string;
    invoice_id?: string;
    deposit_amount?: number;
    total_amount?: number;
    paid_amount?: number;
    items: InvoiceItems[];
    sub_total_amount?: number;
    discount_amount?: number;
    tax_amount?: number;
    customer?: CustomerDetails;
    currency_sign: string;
    payment_schedule?: PaymentScheduleResp[];
    applied_taxes?: AppliedTax[];
}

export class CustomerDetails {
    name?: string;
    phone_number?: string;
    email?: string;
    card_last_digits?: string;
    card_brand_name?: string;
}

export class InvoiceItems {
    name: string;
    amount: number;
    qty?: number;
    discount?: number;
    currency: string;
    currency_sign: string;
}

export class LogisticsPriceResp {
    vehicle_type?: VehicleType;
    estimated_price: LogisticsEstimatedPrice;
    estimated_price_breakdown?: LogisticsEstimatedPriceBreakDown[];
}

export class LogisticsEstimatedPrice {
    amount: number;
    currency: string;
}

export class LogisticsEstimatedPriceBreakDown {
    key: string;
    amount: number;
    quantity?: number;
}

export class NotificationResult {
    isSent: boolean;
}

export class Order {
    id: number;
    short_id: string;
    customer: User;
    booking: Booking;
    currency: string;
    status: OrderStatus;
    order_pick_up_service?: OrderPickUpService;
    total_amount: number;
    created_at: Date;
    updated_at: Date;
    last_status_at?: Date;
}

export class Driver {
    name?: string;
    phone?: string;
}

export class PayOrderResp {
    success: boolean;
}

export class CancelOrderResp {
    success: boolean;
}

export class OrderHistory {
    id: number;
    status: OrderStatus;
    note: string;
    created_at: Date;
    updated_at: Date;
}

export class OrderPickUpService {
    id: number;
    address: string;
    lat: number;
    lng: number;
    pickup_time: Date;
    amount: number;
    discount_amount: number;
    mover_count?: number;
    tax_amount: number;
    total_amount: number;
    currency: string;
    currency_sign: string;
    service: PlatformService;
    created_at: Date;
    updated_at: Date;
    third_party_tracking_id?: string;
    driver?: Driver;
}

export class Payout {
    id: number;
    amount: number;
    commission_percentage: number;
    status: PayoutStatus;
    currency: string;
    created_at: Date;
    updated_at: Date;
}

export class UpdatePayoutResp {
    edges: Payout[];
    modified: number;
}

export class PlatformAgreement {
    id: number;
    title_en: string;
    title_th: string;
    title_jp: string;
    title_kr: string;
    content_en: string;
    content_th: string;
    content_jp: string;
    content_kr: string;
    is_default: boolean;
}

export class PlatformBank {
    id: number;
    name: string;
    address?: string;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}

export class BanksResp {
    page_info: PageInfo;
    edges: PlatformBank[];
}

export class PlatformCommission {
    id: number;
    slug: string;
    percentage: number;
    created_at: Date;
    updated_at: Date;
}

export class PlatformFeatureCategory {
    id: number;
    name_en: string;
    name_th: string;
    name_jp: string;
    name_kr: string;
    features: PlatformFeature[];
}

export class PlatformFeature {
    id: number;
    name_en: string;
    name_th: string;
    name_jp: string;
    name_kr: string;
    description_en?: string;
    description_th?: string;
    description_jp?: string;
    description_kr?: string;
    icon?: string;
    type: PlatformFeatureType;
    category: PlatformFeatureCategory;
    is_active: boolean;
}

export class FeatureCategoryResp {
    page_info: PageInfo;
    edges: PlatformFeatureCategory[];
}

export class PlatformInsurance {
    id: number;
    name_en: string;
    name_th: string;
    name_jp: string;
    name_kr: string;
    country: Country;
    covered_amount: number;
    price_per_day: number;
    third_party_provider: string;
    created_at: Date;
    updated_at: Date;
}

export class InsurancesResp {
    page_info: PageInfo;
    edges: PlatformInsurance[];
}

export class PlatformPolicy {
    id: number;
    name_en: string;
    name_th: string;
    name_jp: string;
    name_kr: string;
    type: PolicyType;
    days: number;
}

export class PlatformPropertyType {
    id: number;
    name_en: string;
    name_th: string;
    name_jp: string;
    name_kr: string;
}

export class PropertyTypeResp {
    page_info: PageInfo;
    edges: PlatformPropertyType[];
}

export class PlatformRule {
    id: number;
    name_en: string;
    name_th: string;
    name_jp: string;
    name_kr: string;
    description_en?: string;
    description_th?: string;
    description_jp?: string;
    description_kr?: string;
    icon?: string;
}

export class PlatformService {
    id: number;
    title_en: string;
    title_th: string;
    title_jp: string;
    title_kr: string;
    description_en: string;
    description_th: string;
    description_jp: string;
    description_kr: string;
    vehicle_title?: string;
    vehicle_code?: string;
    icon?: string;
    price_per_hour?: number;
    fixed_price?: number;
    country: Country;
    third_party_provider: string;
    type: ServiceType;
    frequency: ServiceFrequency;
    max_weight?: number;
    weight_unit?: string;
    size_from?: string;
    created_at: Date;
    updated_at: Date;
    status?: ServiceStatus;
}

export class ServicesResp {
    page_info: PageInfo;
    edges: PlatformService[];
}

export class PlatformSpaceCategory {
    id: number;
    name_en: string;
    name_th: string;
    name_jp: string;
    name_kr: string;
    icon: string;
    items: PlatformSpaceCategoryItem[];
}

export class PlatformSpaceCategoryResp {
    page_info: PageInfo;
    edges: PlatformSpaceCategory[];
}

export class PlatformSpaceCategoryItem {
    id: number;
    name_en: string;
    name_th: string;
    name_jp: string;
    name_kr: string;
    height: number;
    width: number;
    dimension: number;
    unit: SpaceCategoryItemSizeUnit;
    icon?: string;
}

export class PlatformSpaceType {
    id: number;
    size_from: number;
    size_to: number;
    unit: SpaceSizeUnit;
    name_en: string;
    name_th: string;
    name_jp: string;
    name_kr: string;
    description_en?: string;
    description_th?: string;
    description_jp?: string;
    description_kr?: string;
    image?: string;
    icon?: string;
    slug?: string;
    size: number;
    country: Country;
    spaces?: SpaceResp;
    features?: PlatformFeature[];
}

export class PlatformSpaceTypeResp {
    page_info: PageInfo;
    edges: PlatformSpaceType[];
}

export class PlatformTax {
    id: number;
    name_en: string;
    name_th?: string;
    name_jp?: string;
    name_kr?: string;
    description_en?: string;
    description_th?: string;
    description_jp?: string;
    description_kr?: string;
    type: TaxType;
    value: number;
    country: Country;
    city?: City;
    exemptible: boolean;
    is_default: boolean;
    entity_type: TaxEntityType;
    is_active: boolean;
}

export class CustomerBuys {
    id: number;
    type: PromotionBuyTypes;
    value: number;
    site_ids?: number[];
    country_id?: number;
}

export class Promotion {
    id: number;
    name_en: string;
    name_th: string;
    name_jp: string;
    name_kr: string;
    description_en?: string;
    description_th?: string;
    description_jp?: string;
    description_kr?: string;
    format: PromotionFormat;
    status: PromotionStatus;
    code?: string;
    start_date: Date;
    end_date?: Date;
    max?: number;
    max_per_day?: number;
    max_per_customer?: number;
    allow_double_discount?: boolean;
    customer_buys: CustomerBuys[];
    customer_gets: CustomerGets[];
}

export class PromotionsResp {
    edges: Promotion[];
    page_info: PageInfo;
}

export class ApplyPromotionResponse {
    promotion?: Promotion;
    price_per_month: number;
    total: number;
    discounted_amount: number;
    total_after_discount: number;
}

export class QuotationItem {
    id: number;
    site: Site;
    space: Space;
    price_per_month?: number;
    quotation?: Quotation;
}

export class Quotation {
    id: number;
    uuid: string;
    status: QuotationStatus;
    move_in_date: Date;
    promotion?: Promotion;
    public_promotion?: Promotion;
    created_at: Date;
    user: User;
    items: QuotationItem[];
}

export class QuotationResp {
    success: boolean;
}

export class Refund {
    id: number;
    refunded_amount: number;
    refunded_date: Date;
    booking: Booking;
    type: RefundType;
    created_at?: Date;
    updated_at?: Date;
}

export class Review {
    id: number;
    content: string;
    title: string;
    rating: number;
    created_at: Date;
    user?: ReviewUser;
}

export class ReviewsPageInfo {
    limit: number;
    page: number;
    total: number;
    has_more?: boolean;
}

export class ReviewsResp {
    page_info: ReviewsPageInfo;
    edges: Review[];
    rating_info?: ReviewRatingInfo;
}

export class ReviewUser {
    name?: string;
}

export class ReviewRatingInfo {
    average_rating: number;
    total: number;
}

export class Site {
    reviews: ReviewRatingInfo;
    id: number;
    name?: string;
    name_en?: string;
    name_th?: string;
    name_jp?: string;
    name_kr?: string;
    description?: string;
    description_en?: string;
    description_th?: string;
    description_jp?: string;
    description_kr?: string;
    floor?: number;
    is_featured: boolean;
    url_3d?: Url3D[];
    property_type: PlatformPropertyType;
    provider_type: ProviderType;
    rules: PlatformRule[];
    agreement?: PlatformAgreement;
    stock_management_type?: StockManagementType;
    source_site_link?: string;
    source_site_name?: string;
    host_fees?: number;
    distance?: number;
    features: PlatformFeature[];
    policies: PlatformPolicy[];
    address?: SiteAddress;
    google_reviews_widget_id?: string;
    images?: string[];
    status?: SiteStatus;
    spaces: SpaceResp;
    similar_sites: Site[];
    quotation?: Quotation;
    created_at: Date;
    updated_at: Date;
}

export class PageInfo {
    limit: number;
    skip: number;
    total: number;
    has_more?: boolean;
}

export class DeleteResult {
    total_deleted: number;
}

export class SiteAddress {
    id: number;
    lat: number;
    lng: number;
    country: Country;
    city: City;
    district: District;
    postal_code: string;
    street: string;
    flat?: string;
    created_at: Date;
    updated_at: Date;
}

export class SiteDoorHistory {
    id: number;
    site_door_id: number;
    action: DoorActionType;
    user_ip?: string;
    user_agent?: string;
    user_device?: string;
    platform?: string;
    created_at: Date;
}

export class SiteDoor {
    id: number;
    name: string;
    description?: string;
    provider_id: string;
    door_id: string;
    created_at: Date;
    updated_at: Date;
    history: SiteDoorHistory[];
}

export class SiteDoorsResp {
    page_info: PageInfo;
    edges: SiteDoor[];
}

export class OpenSiteDoorResp {
    is_open: boolean;
    status?: string;
    message?: string;
}

export class Url3D {
    floor: number;
    url: string;
}

export class UpdateSiteResp {
    edges: Site[];
    modified: number;
}

export class SpaceResp {
    page_info: PageInfo;
    edges: Space[];
}

export class SitesResp {
    page_info: PageInfo;
    edges: Site[];
}

export class Calendar {
    id: number;
    space: Space;
    start_date: Date;
    end_date: Date;
}

export class SpacePrice {
    id: number;
    price_per_day?: number;
    price_per_week?: number;
    price_per_month?: number;
    price_per_year?: number;
    currency: string;
    currency_sign: string;
    type: PriceType;
    start_date?: Date;
    end_date?: Date;
}

export class Space {
    id: number;
    name?: string;
    site: Site;
    size: number;
    height: number;
    width: number;
    length: number;
    size_unit: SpaceSizeUnit;
    prices: SpacePrice[];
    status: SpaceStatus;
    total_units: number;
    available_units?: number;
    stock_available_until?: Date;
    quotation?: Quotation;
    stock_management_type?: StockManagementType;
    images?: string[];
    features: PlatformFeature[];
    space_type?: PlatformSpaceType;
}

export class UpdateSpaceResp {
    edges: Space[];
    modified: number;
}

export class DeleteSpaceResp {
    success: boolean;
}

export class SpacesResp {
    page_info: PageInfo;
    edges: Space[];
}

export class Termination {
    id: number;
    move_out_date: Date;
    termination_date: Date;
    failed_renewals_amount: number;
    remaining_days_amount: number;
    unused_days_amount: number;
    notice_period_amount: number;
    promotion_amount: number;
    discount: number;
    total_amount: number;
    status: TerminationStatus;
    payment_status: TerminationPaymentStatus;
    currency: string;
    currency_sign: string;
    is_overdue: boolean;
    created_at: Date;
    updated_at: Date;
}

export class CalculateTerminationDuesResp {
    move_out_date: Date;
    termination_date: Date;
    failed_renewals_amount: number;
    remaining_days_amount: number;
    notice_period_amount: number;
    promotion_amount: number;
    total_amount: number;
    currency: string;
    currency_sign: string;
}

export class PayTerminationResp {
    success: boolean;
}

export type date = any;
export type JSON = any;
export type JSONObject = any;
