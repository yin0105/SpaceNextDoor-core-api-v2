module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      const cols = await queryInterface.describeTable('transactions');
      if (!cols.invoice_id) {
        await Promise.all([
          queryInterface.addColumn(
            'transactions',
            'invoice_id',
            {
              type: Sequelize.DataTypes.STRING,
              allowNull: true,
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
        queryInterface.removeColumn('transactions', 'invoice_id', {
          transaction: t,
        }),
      ]);
    });
  },
};
