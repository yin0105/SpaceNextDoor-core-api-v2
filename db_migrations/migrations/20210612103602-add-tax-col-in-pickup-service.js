module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      const cols = await queryInterface.describeTable('orders_pick_up_service');
      if (!cols.tax_amount) {
        await Promise.all([
          queryInterface.addColumn(
            'orders_pick_up_service',
            'tax_amount',
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
        queryInterface.removeColumn('orders_pick_up_service', 'tax_amount', {
          transaction: t,
        }),
      ]);
    });
  },
};
