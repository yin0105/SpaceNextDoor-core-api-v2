module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      const cols = await queryInterface.describeTable('quotations_items');
      if (!cols.booking_id) {
        await Promise.all([
          queryInterface.addColumn(
            'quotations_items',
            'booking_id',
            {
              type: Sequelize.DataTypes.INTEGER,
              allowNull: true,
              references: {
                model: 'bookings',
                key: 'id',
              },
              defaultValue: null,
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
        queryInterface.removeColumn('quotations_items', 'booking_id', {
          transaction: t,
        }),
      ]);
    });
  },
};
