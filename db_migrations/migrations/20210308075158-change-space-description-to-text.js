module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      // before creating, first check column doesn't exists
      await Promise.all([
        queryInterface.changeColumn(
          'spaces',
          'description',
          {
            type: Sequelize.DataTypes.TEXT,
            allowNull: true,
          },
          { transaction: t },
        ),
      ]);
    });
  },
  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.changeColumn(
          'spaces',
          'description',
          {
            type: Sequelize.DataTypes.TEXT,
            allowNull: true,
          },
          { transaction: t },
        ),
      ]);
    });
  },
};
