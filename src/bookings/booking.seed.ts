import { BookingPayload } from '../graphql.schema';

export const bookingPayload: BookingPayload = {
  name: 'test',
  email: 'test@gmail.com',
  phone_number: '+66640359454',
  site_id: 1,
  space_id: 1,
  auto_renewal: false,
  move_in_date: new Date(),
  move_out_date: new Date(),
};
