import {
  PlatformFeature,
  PlatformFeatureCategory,
} from '../../../graphql.schema';

export interface IPlatformFeatureCategoryEntity
  extends Omit<PlatformFeatureCategory, 'features'> {
  created_by: number;
  created_at: Date;
}

export interface IPlatformFeatureEntity extends PlatformFeature {
  created_by: number;
  created_at: Date;
}
