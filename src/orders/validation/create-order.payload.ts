import * as yup from 'yup';

export default yup.object().shape({
  pickup_service_details: yup
    .object()
    .shape({
      address: yup.string().required(),
      lat: yup.number().required(),
      lng: yup.number().required(),
      pickup_time: yup.string().required(),
      service_id: yup.number().required(),
    })
    .required(),
  booking_id: yup.number().required(),
});
