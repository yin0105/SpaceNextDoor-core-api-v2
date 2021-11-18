module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      const cols = await queryInterface.describeTable('renewals');
      if (!cols.booking_promotion_id) {
        await Promise.all([
          queryInterface.addColumn(
            'renewals',
            'booking_promotion_id',
            {
              type: Sequelize.DataTypes.INTEGER,
              allowNull: true,
              index: true,
              references: {
                model: 'bookings_promotions',
                key: 'id',
              },
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
        queryInterface.removeColumn('renewals', 'booking_promotion_id', {
          transaction: t,
        }),
      ]);
    });
  },
};
