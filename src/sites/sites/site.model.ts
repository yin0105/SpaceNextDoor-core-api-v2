import {
  AllowNull,
  AutoIncrement,
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  Default,
  ForeignKey,
  HasMany,
  Index,
  Model,
  PrimaryKey,
  Sequelize,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';

import { UserModel } from '../../auth/users/user.model';
import { EntityTaxModel } from '../../entity-taxes/entity-tax.model';
import {
  ProviderType,
  SiteStatus,
  StockManagementType,
  Url3D,
} from '../../graphql.schema';
import { PlatformAgreementModel } from '../../platform/agreements/agreement.model';
import { PlatformCommissionModel } from '../../platform/commissions/commission.model';
import { PlatformPropertyTypeModel } from '../../platform/property-types/property-type.model';
import { SpaceModel } from '../../spaces/spaces/space.model';
import { SiteAddressModel } from '../site-addresses/site-address.model';
import { SiteDoorModel } from '../site-doors/site-door.model';
import { SiteFeatureModel } from '../site-features/site-feature.model';
import { SitePolicyModel } from '../site-policies/site-policy.model';
import { SiteRuleModel } from '../site-rules/site-rule.model';
import { ISiteEntity } from './interfaces/site.interface';

@Table({
  modelName: 'SiteModel',
  tableName: 'sites',
})
export class SiteModel extends Model<ISiteEntity> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  @Index
  id: number;

  @AllowNull(true)
  @Column(DataType.STRING)
  name: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  name_en: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  name_th: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  name_jp: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  name_kr: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  description: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  description_en: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  description_th: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  description_jp: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  description_kr: string;

  @AllowNull(false)
  @ForeignKey(() => PlatformPropertyTypeModel)
  @Column(DataType.INTEGER)
  property_type_id: number;

  @AllowNull(false)
  @ForeignKey(() => PlatformCommissionModel)
  @Column(DataType.INTEGER)
  commission_id: number;

  @AllowNull(true)
  @Column(DataType.INTEGER)
  floor: number;

  @AllowNull(true)
  @Column(DataType.VIRTUAL)
  distance: number;

  @AllowNull(true)
  @Column(DataType.ENUM(ProviderType.INDIVIDUAL, ProviderType.BUSINESS))
  provider_type: string;

  @AllowNull(false)
  @ForeignKey(() => UserModel)
  @Column(DataType.INTEGER)
  user_id: number;

  @AllowNull(true)
  @ForeignKey(() => SiteAddressModel)
  @Column(DataType.INTEGER)
  address_id: number;

  @AllowNull(false)
  @Default(SiteStatus.DRAFT)
  @Column(
    DataType.ENUM(
      SiteStatus.ACTIVE,
      SiteStatus.DRAFT,
      SiteStatus.INACTIVE,
      SiteStatus.READY_TO_REVIEW,
      SiteStatus.REJECTED,
    ),
  )
  status: SiteStatus;

  @AllowNull(true)
  @Default(null)
  @Column(DataType.TEXT)
  rejection_reason: string;

  @AllowNull(true)
  @Default(null)
  @ForeignKey(() => PlatformAgreementModel)
  @Column(DataType.INTEGER)
  agreement_id: number;

  @AllowNull(true)
  @Default(0)
  @Column(DataType.FLOAT)
  host_fees: number;

  @AllowNull(true)
  @Column(DataType.ARRAY(DataType.TEXT))
  images: string[];

  @AllowNull(false)
  @Index
  @Default(StockManagementType.SND)
  @Column(
    DataType.ENUM(
      StockManagementType.SND,
      StockManagementType.THIRD_PARTY,
      StockManagementType.AFFILIATE,
    ),
  )
  stock_management_type: StockManagementType;

  @AllowNull(true)
  @Column(DataType.STRING)
  third_party_provider: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  @Index
  third_party_site_id: string;

  @AllowNull(true)
  @Default(null)
  @Column(DataType.STRING)
  source_site_link: string;

  @AllowNull(true)
  @Default(null)
  @Column(DataType.STRING)
  source_site_name: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  google_reviews_widget_id: string[];

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  @Index
  is_featured: boolean;

  @AllowNull(true)
  @Column(DataType.ARRAY(DataType.JSON))
  url_3d: Url3D[];

  @Column(DataType.INTEGER)
  created_by: number;

  @Column(DataType.INTEGER)
  updated_by: number;

  @CreatedAt
  @Default(Sequelize.fn('NOW'))
  @Column(DataType.DATE)
  created_at: Date;

  @UpdatedAt
  @Default(Sequelize.fn('NOW'))
  @Column(DataType.DATE)
  updated_at: Date;

  //
  // Relation/Association between the other tables

  @BelongsTo(() => SiteAddressModel)
  address: SiteAddressModel;

  @BelongsTo(() => UserModel)
  user: UserModel;

  @BelongsTo(() => PlatformCommissionModel)
  commission: PlatformCommissionModel;

  @BelongsTo(() => PlatformPropertyTypeModel)
  property_type: PlatformPropertyTypeModel;

  @BelongsTo(() => PlatformAgreementModel)
  agreement: PlatformAgreementModel;

  @HasMany(() => SpaceModel)
  spaces: SpaceModel[];

  @HasMany(() => SiteFeatureModel)
  features: SiteFeatureModel[];

  @HasMany(() => SiteRuleModel)
  rules: SiteRuleModel[];

  @HasMany(() => SitePolicyModel)
  policies: SitePolicyModel[];

  @HasMany(() => EntityTaxModel)
  entity_taxes: EntityTaxModel[];

  @HasMany(() => SiteDoorModel)
  doors: SiteDoorModel[];
}
