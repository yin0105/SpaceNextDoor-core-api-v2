module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      const cols = await queryInterface.describeTable('platform_services');
      if (!cols.status) {
        await Promise.all([
          queryInterface.addColumn(
            'platform_services',
            'status',
            {
              type: Sequelize.DataTypes.ENUM('ACTIVE', 'INACTIVE'),
              defaultValue: 'INACTIVE',
              allowNull: false,
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
        queryInterface.removeColumn('platform_services', 'status', {
          transaction: t,
        }),
      ]);
    });
  },
};
