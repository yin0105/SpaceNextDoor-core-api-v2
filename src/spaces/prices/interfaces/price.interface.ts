import { SpacePrice } from '../../../graphql.schema';

export interface ISpacePriceEntity extends SpacePrice {
  space_id: number;
  created_at: Date;
  updated_at: Date;
}
