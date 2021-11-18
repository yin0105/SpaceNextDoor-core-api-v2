import { Calendar } from '../../../graphql.schema';

export interface ICalendarEntity extends Omit<Calendar, 'space'> {
  space_id: number;
  created_at: Date;
  updated_at: Date;
}
