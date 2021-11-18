import * as yup from 'yup';

export default yup.object().shape({
  name: yup.string().trim(),
  property_type_id: yup.number(),
  rules_id: yup.array(yup.number()).optional(),
  features_id: yup.array(yup.number()).optional(),
  policies_id: yup.array(yup.number()).optional(),
  address: yup
    .object()
    .shape({
      country_id: yup.number().optional(),
      city_id: yup.number().optional(),
      district_id: yup.number().optional(),
      state: yup.string().optional(),
      street: yup.string().optional(),
      postal_code: yup.string().optional(),
      lat: yup.number().optional(),
      lng: yup.number().optional(),
    })
    .optional(),
});
