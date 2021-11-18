module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      const cols = await queryInterface.describeTable('platform_services');
      if (!cols.vehicle_code) {
        await Promise.all([
          queryInterface.addColumn(
            'platform_services',
            'vehicle_code',
            {
              type: Sequelize.DataTypes.STRING,
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
        queryInterface.removeColumn('platform_services', 'vehicle_code', {
          transaction: t,
        }),
      ]);
    });
  },
};
