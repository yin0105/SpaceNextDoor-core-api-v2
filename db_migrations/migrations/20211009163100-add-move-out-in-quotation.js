module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      const cols = await queryInterface.describeTable('quotations');
      if (!cols.move_out_date) {
        await Promise.all([
          queryInterface.addColumn(
            'quotations',
            'move_out_date',
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
        queryInterface.removeColumn('quotations', 'move_out_date', {
          transaction: t,
        }),
      ]);
    });
  },
};
