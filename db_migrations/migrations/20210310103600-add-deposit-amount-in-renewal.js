module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      const cols = await queryInterface.describeTable('renewals');
      if (!cols.deposit_amount) {
        await Promise.all([
          queryInterface.addColumn(
            'renewals',
            'deposit_amount',
            {
              type: Sequelize.DataTypes.FLOAT,
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
        queryInterface.removeColumn('renewals', 'deposit_amount', {
          transaction: t,
        }),
      ]);
    });
  },
};
