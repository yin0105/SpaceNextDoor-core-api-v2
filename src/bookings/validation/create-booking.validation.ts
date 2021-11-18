import * as yup from 'yup';

export default yup.object().shape({
  name: yup.string().required(),
  email: yup.string().email().required(),
  phone_number: yup.string().required(),
  move_in_date: yup.date().required(),
  move_out_date: yup.date().optional(),
  auto_renewal: yup.boolean().required(),
  space_id: yup.number().required(),
  site_id: yup.number().required(),
  promo_code: yup.string().trim().optional(),
  promotion_id: yup.number().optional(),
});
