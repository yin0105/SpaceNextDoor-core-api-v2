module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      const cols = await queryInterface.describeTable('renewals');
      if (!cols.total_tax_amount) {
        await Promise.all([
          queryInterface.addColumn(
            'renewals',
            'total_tax_amount',
            {
              type: Sequelize.DataTypes.FLOAT,
              defaultValue: 0,
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
        queryInterface.removeColumn('renewals', 'total_tax_amount', {
          transaction: t,
        }),
      ]);
    });
  },
};
