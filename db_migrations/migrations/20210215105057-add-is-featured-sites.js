module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      const cols = await queryInterface.describeTable('sites')
      if (!cols.is_featured) {
        await Promise.all([
          queryInterface.addColumn(
            'sites',
            'is_featured',
            {
              type: Sequelize.DataTypes.BOOLEAN,
              defaultValue: false,
              allowNull: false,
              index: true,
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
        queryInterface.removeColumn('sites', 'is_featured', {
          transaction: t,
        }),
      ]);
    });
  },
};
