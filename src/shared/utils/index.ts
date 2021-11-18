import _ from 'lodash';

import { Pagination } from '../../graphql.schema';

type PaginationKey = 'limit' | 'skip';
type PartialList = Partial<Record<PaginationKey, number>>;

export const initPagination = <T extends PartialList>(arg?: T): T => {
  let limit = arg?.limit;
  let skip = arg?.skip;

  switch (true) {
    case _.isNil(limit): {
      limit = 5;
      break;
    }
    case limit < 0: {
      limit = 5;
    }
  }

  switch (true) {
    case _.isNil(skip): {
      skip = 0;
      break;
    }
    case skip < 0: {
      skip = 0;
    }
  }

  return { limit, skip } as T;
};

export const hasMoreRec = (count: number, pagination: Pagination): boolean =>
  count > pagination.skip + pagination.limit;
