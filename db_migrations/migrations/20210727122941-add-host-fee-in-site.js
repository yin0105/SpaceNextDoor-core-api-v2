'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      const cols = await queryInterface.describeTable('sites');
      if (!cols.host_fees) {
        await Promise.all([
          queryInterface.addColumn(
            'sites',
            'host_fees',
            {
              type: Sequelize.DataTypes.FLOAT,
              allowNull: true,
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
        queryInterface.removeColumn('sites', 'host_fees', {
          transaction: t,
        }),
      ]);
    });
  },
};
