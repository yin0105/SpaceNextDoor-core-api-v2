module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      const cols = await queryInterface.describeTable('transactions');
      if (!cols.short_id) {
        await Promise.all([
          queryInterface.addColumn(
            'transactions',
            'short_id',
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
        queryInterface.removeColumn('transactions', 'short_id', {
          transaction: t,
        }),
      ]);
    });
  },
};
