module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      const cols = await queryInterface.describeTable('promotions_customer_buys');
      if (!cols.site_id) {
        await Promise.all([
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
        ]);
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn('promotions_customer_buys', 'site_id', {
          transaction: t,
        }),
      ]);
    });
  },
};
