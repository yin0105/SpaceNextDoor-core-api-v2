module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      const cols = await queryInterface.describeTable('renewals');
      if (!cols.last_attempt_date) {
        await Promise.all([
          queryInterface.addColumn(
            'renewals',
            'last_attempt_date',
            {
              type: Sequelize.DataTypes.DATE,
              allowNull: true,
              defaultValue: null,
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
        queryInterface.removeColumn('renewals', 'last_attempt_date', {
          transaction: t,
        }),
      ]);
    });
  },
};
