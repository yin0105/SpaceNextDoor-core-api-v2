module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      const cols = await queryInterface.describeTable(
        'bookings_promotions_customer_buys',
      );
      const promises = [];
      if (cols.site_id) {
        promises.push(
          queryInterface.removeColumn('bookings_promotions_customer_buys', 'site_id', {
            transaction: t,
          }),
        );
      }

      return Promise.all(promises);
    });
  },
  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          'bookings_promotions_customer_buys',
          'site_id',
          {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: true,
            default: null,
          },
          { transaction: t },
        ),
      ]);
    });
  },
};
