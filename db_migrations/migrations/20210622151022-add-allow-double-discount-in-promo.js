'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      const cols = await queryInterface.describeTable('promotions');
      if (!cols.allow_double_discount) {
        await Promise.all([
          queryInterface.addColumn(
            'promotions',
            'allow_double_discount',
            {
              type: Sequelize.DataTypes.BOOLEAN,
              defaultValue: true,
            },
            { transaction: t },
          ),
        ]);
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn('promotions', 'allow_double_discount', {
          transaction: t,
        }),
      ]);
    });
  },
};
