/* eslint-disable @typescript-eslint/tslint/config */
import { Op, WhereOperators } from 'sequelize';
import { OrderItem } from 'sequelize/types';

import { SortBy } from '../../graphql.schema';

const allowedOperations = {
  _gt: Op.gt,
  _lt: Op.lt,
  _eq: Op.eq,
  _gte: Op.gte,
  _lte: Op.lte,
  _in: Op.in,
  _like: Op.like,
  _iLike: Op.iLike,
};

enum Operations {
  _gt = '_gt',
  _lt = '_lt',
  _eq = '_eq',
  _gte = '_gte',
  _lte = '_lte',
  _in = '_in',
  _like = '_like',
  _iLike = '_iLike',
}

interface ComparatorReturnType {
  [k: string]: WhereOperators;
}

type IComparatorInput<T> = {
  [key in keyof T]: { [k in Operations]?: any };
};

export const toSequelizeComparator = <T>(
  where: IComparatorInput<T> = ({} as unknown) as IComparatorInput<T>,
): ComparatorReturnType => {
  // validate operators (if we support them) else throw error
  // generate comparator for sequelize
  // return comparator
  const convertedFields = {};

  Object.keys(where).forEach((field) => {
    const fieldOperations = where[field];
    if (fieldOperations) {
      Object.keys(fieldOperations).forEach((op) => {
        // If we don't support that operation, error out
        if (!allowedOperations[op]) {
          throw Error(`Operation ${op} is not supported!`);
        }

        convertedFields[field] = {
          // e.g _lt: 23
          [allowedOperations[op]]: fieldOperations[op],
          ...(convertedFields[field] || {}),
        };
      });
    }
  });

  return convertedFields;
};

export const validateWhereParamsAtLeastOne = <T>(
  where: IComparatorInput<T> = ({} as unknown) as IComparatorInput<T>,
  options: { validateParent: boolean } = { validateParent: true },
): void => {
  if (where !== null && typeof where === 'object') {
    const keys = Object.keys(where);
    if (options.validateParent && !keys.length) {
      throw new Error('At least one of the params of where filter required');
    }

    keys.forEach((key) => {
      validateWhereParamsAtLeastOne(where[key]);
    });
  }

  return;
};

type ISortObject<T> = {
  [key in keyof T]: SortBy;
};

export const toSequelizeSort = <T>(sortBy: ISortObject<T>): OrderItem[] => {
  const sortOrder: string[][] = [];

  // Transform from Object to Array
  // { id: SortDirection.ASC } to [ "id", "ASC"]

  for (const [key, value] of Object.entries(sortBy)) {
    sortOrder.push([key, value.toString()]);
  }

  return sortOrder as OrderItem[];
};
