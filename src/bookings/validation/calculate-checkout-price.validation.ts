import * as yup from 'yup';

export default yup.object().shape({
  move_in_date: yup.date().required(),
  move_out_date: yup.date().optional(),
  space_id: yup.number().required(),
  insurance_id: yup.number().optional(),
  quotation_item_id: yup.number().optional(),
  pick_up_service_id: yup.number().optional(),
  pickup_service_details: yup
    .object({
      schedule_at: yup.date(),
      pick_up_location: yup
        .object({
          lat: yup.number(),
          lng: yup.number(),
        })
        .required(),
    })
    .when('pick_up_service_id', {
      is: yup.number(),
      then: yup.object().required(),
      otherwise: yup.object().optional(),
    }),
});
