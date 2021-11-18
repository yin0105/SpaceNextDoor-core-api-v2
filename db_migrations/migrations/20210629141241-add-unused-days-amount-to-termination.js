'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      const cols = await queryInterface.describeTable('terminations');
      if (!cols.unused_days_amount) {
        await Promise.all([
          queryInterface.addColumn(
            'terminations',
            'unused_days_amount',
            {
              type: Sequelize.DataTypes.FLOAT,
              defaultValue: 0,
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
        queryInterface.removeColumn('terminations', 'unused_days_amount', {
          transaction: t,
        }),
      ]);
    });
  },
};
