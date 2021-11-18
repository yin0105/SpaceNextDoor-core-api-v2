module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      const cols = await queryInterface.describeTable('orders_pick_up_service');
      if (!cols.third_party_tracking_id) {
        await Promise.all([
          queryInterface.addColumn(
            'orders_pick_up_service',
            'third_party_tracking_id',
            {
              type: Sequelize.DataTypes.TEXT,
              allowNull: true,
              index: false,
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
        queryInterface.removeColumn('orders_pick_up_service', 'third_party_tracking_id', {
          transaction: t,
        }),
      ]);
    });
  },
};
