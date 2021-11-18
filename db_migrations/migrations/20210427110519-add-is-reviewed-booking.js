module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      const cols = await queryInterface.describeTable('bookings')
      if (!cols.is_reviewed) {
        await Promise.all([
          queryInterface.addColumn(
            'bookings',
            'is_reviewed',
            {
              type: Sequelize.DataTypes.BOOLEAN,
              defaultValue: false,
              allowNull: false,
              index: true,
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
        queryInterface.removeColumn('bookings', 'is_reviewed', {
          transaction: t,
        }),
      ]);
    });
  },
};
