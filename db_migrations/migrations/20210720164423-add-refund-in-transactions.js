module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      const cols = await queryInterface.describeTable('transactions');
      if (!cols.renewal_id) {
        await Promise.all([
          queryInterface.addColumn(
            'transactions',
            'renewal_id',
            {
              type: Sequelize.DataTypes.INTEGER,
              allowNull: true,
              references: {
                model: 'renewals',
                key: 'id',
              },
            },
            { transaction: t },
          ),
          queryInterface.addColumn(
            'transactions',
            'refund_id',
            {
              type: Sequelize.DataTypes.INTEGER,
              allowNull: true,
              references: {
                model: 'refunds',
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
        queryInterface.removeColumn('transactions', 'renewal_id', {
          transaction: t,
        }),
        queryInterface.removeColumn('transactions', 'refund_id', {
          transaction: t,
        }),
      ]);
    });
  },
};
