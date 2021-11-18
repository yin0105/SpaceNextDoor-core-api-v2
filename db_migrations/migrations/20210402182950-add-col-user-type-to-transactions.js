module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      const cols = await queryInterface.describeTable('transactions')
      if (!cols.user_id) {
        try {
          await queryInterface.sequelize.query(`DROP TYPE enum_transactions_type`)
        } catch(_) {
          console.log('Type does not exists')
        }

        await Promise.all([
          queryInterface.addColumn(
            'transactions',
            'type',
            {
              type: Sequelize.DataTypes.ENUM('BOOKING', 'ORDER', 'BOOKING_ORDER', 'TERMINATION'),
              defaultValue: 'BOOKING',
              allowNull: false,
            },
            { transaction: t },
          ),
          queryInterface.addColumn(
            'transactions',
            'user_id',
            {
              type: Sequelize.DataTypes.INTEGER,
              references: {
                model: 'users',
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
        queryInterface.removeColumn('transactions', 'type', {
          transaction: t,
        }),
        queryInterface.removeColumn('transactions', 'user_id', {
          transaction: t,
        }),
      ]);
    });
  },
};
