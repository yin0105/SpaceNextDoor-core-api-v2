import * as yup from 'yup';

import { SpaceSizeUnit } from '../../../graphql.schema';

export default yup.object().shape({
  width: yup.number().optional(),
  height: yup.number().optional(),
  length: yup.number().optional(),
  price_per_month: yup.number().optional(),
  size_unit: yup.string().oneOf(Object.values(SpaceSizeUnit)).optional(),
  total_units: yup.number().optional(),
  images: yup.array(yup.string()).optional(),
  features_id: yup.array(yup.number()).optional(),
});
