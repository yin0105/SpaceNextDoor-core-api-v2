module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      const cols = await queryInterface.describeTable('bookings');
      if (!cols.total_tax_amount) {
        await Promise.all([
          queryInterface.addColumn(
            'bookings',
            'total_tax_amount',
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
        queryInterface.removeColumn('bookings', 'total_tax_amount', {
          transaction: t,
        }),
      ]);
    });
  },
};
