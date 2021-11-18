module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      // before creating, first check column doesn't exists
      const cols = await queryInterface.describeTable('spaces')
      if (!cols.available_units) {
        await Promise.all([
          queryInterface.addColumn(
            'spaces',
            'available_units',
            {
              type: Sequelize.DataTypes.INTEGER,
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
        queryInterface.removeColumn('spaces', 'available_units', {
          transaction: t,
        }),
      ]);
    });
  },
};
