import * as yup from 'yup';

import { SpaceSizeUnit } from '../../../graphql.schema';

export default yup.object().shape({
  site_id: yup.number().required(),
  width: yup.number().required(),
  height: yup.number().required(),
  length: yup.number().required(),
  price_per_month: yup.number().required(),
  size_unit: yup.string().oneOf(Object.values(SpaceSizeUnit)).required(),
  total_units: yup.number().required(),
  features_id: yup.array(yup.number()).optional(),
});
