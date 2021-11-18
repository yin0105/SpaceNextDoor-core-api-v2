module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      const cols = await queryInterface.describeTable('sites');
      if (!cols.commission_id) {
        await Promise.all([
          queryInterface.addColumn(
            'sites',
            'commission_id',
            {
              type: Sequelize.DataTypes.INTEGER,
              allowNull: true,
              index: true,
              references: {
                model: 'platform_commissions',
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
        queryInterface.removeColumn('sites', 'commission_id', {
          transaction: t,
        }),
      ]);
    });
  },
};
