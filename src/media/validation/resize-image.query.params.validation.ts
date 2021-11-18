import * as yup from 'yup';

export default yup.object().shape({
  imageKey: yup.string().required(),
  size: yup.string().required(),
});
