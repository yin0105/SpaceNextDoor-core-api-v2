import _ from 'lodash';
export /**
 * Sequelize return object with Sequelize metadata
 * This utility convert the sequelize metadata into object with no extra metadata
 * @param {*} response
 * @returns
 */
const getPlainObject = (response: unknown): any => {
  const flattenDataValues: any = ({ dataValues }) =>
    _.mapValues(dataValues, (value) =>
      _.isArray(value) &&
      _.isObject(value[0]) &&
      _.isObject((value[0] as any).dataValues)
        ? _.map(value, flattenDataValues)
        : _.isObject(value) && _.isObject((value as any).dataValues)
        ? flattenDataValues(value as any)
        : value,
    );
  return _.isArray(response)
    ? _.map(response, flattenDataValues)
    : flattenDataValues(response);
};

export const hasMore = (count: number, limit: number, skip: number): boolean =>
  count > limit + skip ? true : false;
