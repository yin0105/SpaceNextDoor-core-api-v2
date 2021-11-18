module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      const cols = await queryInterface.describeTable('bookings');
      if (!cols.commitment_months) {
        await Promise.all([
          queryInterface.addColumn(
            'bookings',
            'commitment_months',
            {
              type: Sequelize.DataTypes.INTEGER,
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
        queryInterface.removeColumn('bookings', 'commitment_months', {
          transaction: t,
        }),
      ]);
    });
  },
};
