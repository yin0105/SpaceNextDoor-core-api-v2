module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      const cols = await queryInterface.describeTable('bookings');
      if (!cols.is_termination_requested) {
        await Promise.all([
          queryInterface.addColumn(
            'bookings',
            'is_termination_requested',
            {
              type: Sequelize.DataTypes.BOOLEAN,
              default: false,
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
        queryInterface.removeColumn('bookings', 'is_termination_requested', {
          transaction: t,
        }),
      ]);
    });
  },
};
