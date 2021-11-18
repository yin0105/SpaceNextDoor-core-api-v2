'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      const cols = await queryInterface.describeTable('orders_pick_up_service');
      if (!cols.mover_count) {
        await Promise.all([
          queryInterface.addColumn(
            'orders_pick_up_service',
            'mover_count',
            {
              type: Sequelize.DataTypes.INTEGER,
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
        queryInterface.removeColumn('orders_pick_up_service', 'mover_count', {
          transaction: t,
        }),
      ]);
    });
  },
};
