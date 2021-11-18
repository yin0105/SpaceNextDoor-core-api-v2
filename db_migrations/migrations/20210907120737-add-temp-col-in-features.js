'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      const cols = await queryInterface.describeTable('platform_features');
      if (!cols.temp_names) {
        await Promise.all([
          queryInterface.addColumn(
            'platform_features',
            'temp_names',
            {
              type: Sequelize.DataTypes.TEXT,
              allowNull: true,
            },
            { transaction: t },
          ),
        ]);

        await queryInterface.sequelize.query(
          'UPDATE "platform_features" SET temp_names = name_jp',
          { transaction: t },
        );
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn('platform_features', 'temp_names', {
          transaction: t,
        }),
      ]);
    });
  },
};
