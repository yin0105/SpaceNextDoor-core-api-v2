module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      const cols = await queryInterface.describeTable('bookings');
      if (!cols.insurance_amount) {
        await Promise.all([
          queryInterface.addColumn(
            'bookings',
            'insurance_amount',
            {
              type: Sequelize.DataTypes.FLOAT,
              allowNull: true,
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
        queryInterface.removeColumn('bookings', 'insurance_amount', {
          transaction: t,
        }),
      ]);
    });
  },
};
