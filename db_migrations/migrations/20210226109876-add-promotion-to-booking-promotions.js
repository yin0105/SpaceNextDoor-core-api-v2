module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      const cols = await queryInterface.describeTable('bookings_promotions');
      if (!cols.promotion_id) {
        await Promise.all([
          queryInterface.addColumn(
            'bookings_promotions',
            'promotion_id',
            {
              type: Sequelize.DataTypes.INTEGER,
              allowNull: true,
              index: true,
              references: {
                model: 'promotions',
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
        queryInterface.removeColumn('bookings_promotions', 'promotion_id', {
          transaction: t,
        }),
      ]);
    });
  },
};
