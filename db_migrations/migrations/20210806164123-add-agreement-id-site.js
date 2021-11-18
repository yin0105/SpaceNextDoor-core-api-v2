module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      const cols = await queryInterface.describeTable('sites');
      if (!cols.agreement_id) {
        await Promise.all([
          queryInterface.addColumn(
            'sites',
            'agreement_id',
            {
              type: Sequelize.DataTypes.INTEGER,
              allowNull: true,
              references: {
                model: 'platform_agreements',
                key: 'id',
              },
              defaultValue: null,
            },
            { transaction: t },
          ),
          queryInterface.removeColumn('sites', 'agreement', { transaction: t }),
        ]);
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          'sites',
          'agreement',
          {
            type: Sequelize.DataTypes.TEXT,
            allowNull: true,
            defaultValue: null,
          },
          {
            transaction: t,
          },
        ),
        queryInterface.removeColumn('sites', 'agreement_id', {
          transaction: t,
        }),
      ]);
    });
  },
};
