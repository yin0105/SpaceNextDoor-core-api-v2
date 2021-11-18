module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      const cols = await queryInterface.describeTable('promotions_customer_buys');
      if (!cols.country_ids) {
        await Promise.all([
          queryInterface.addColumn(
            'promotions_customer_buys',
            'country_ids',
            {
              type: Sequelize.DataTypes.ARRAY(Sequelize.DataTypes.INTEGER),
              allowNull: true,
              defaultValue: [],
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
        queryInterface.removeColumn('promotions_customer_buys', 'country_ids', {
          transaction: t,
        }),
      ]);
    });
  },
};
