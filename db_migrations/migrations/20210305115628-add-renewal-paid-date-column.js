module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      const cols = await queryInterface.describeTable('renewals');
      if (!cols.renewal_paid_date) {
        await Promise.all([
          queryInterface.addColumn(
            'renewals',
            'renewal_paid_date',
            {
              type: Sequelize.DataTypes.DATE,
              allowNull: true,
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
        queryInterface.removeColumn('renewals', 'renewal_paid_date', {
          transaction: t,
        }),
      ]);
    });
  },
};
