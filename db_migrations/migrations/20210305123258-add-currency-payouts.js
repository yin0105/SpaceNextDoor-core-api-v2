module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      const cols = await queryInterface.describeTable('payouts');
      if (!cols.currency) {
        await Promise.all([
          queryInterface.addColumn(
            'payouts',
            'currency',
            {
              type: Sequelize.DataTypes.STRING,
              allowNull: false,
              index: false,
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
        queryInterface.removeColumn('payouts', 'currency', {
          transaction: t,
        }),
      ]);
    });
  },
};
