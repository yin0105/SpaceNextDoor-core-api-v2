module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      const cols = await queryInterface.describeTable(
        'promotions_customer_buys',
      );
      const promises = [];
      if (cols.site_id) {
        promises.push(
          queryInterface.removeColumn('promotions_customer_buys', 'site_id', {
            transaction: t,
          }),
        );
      }

      if (!cols.site_ids) {
        promises.push(
          queryInterface.addColumn(
            'promotions_customer_buys',
            'site_ids',
            {
              type: Sequelize.DataTypes.ARRAY(Sequelize.DataTypes.INTEGER),
              defaultValue: [],
            },
            { transaction: t },
          ),
        );
      }

      return Promise.all(promises);
    });
  },
  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          'promotions_customer_buys',
          'site_id',
          {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: true,
            default: null,
          },
          { transaction: t },
        ),
        queryInterface.removeColumn('promotions_customer_buys', 'site_ids', {
          transaction: t,
        }),
      ]);
    });
  },
};
