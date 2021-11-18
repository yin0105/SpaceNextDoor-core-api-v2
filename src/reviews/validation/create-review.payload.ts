import * as yup from 'yup';

export default yup.object().shape({
  rating: yup.number().required().min(0).max(5),
  content: yup.string().required(),
  title: yup.string().required(),
  booking_id: yup.number().required(),
});
