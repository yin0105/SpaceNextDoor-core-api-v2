'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      const cols = await queryInterface.describeTable('sites');
      if (!cols.agreement) {
        await Promise.all([
          queryInterface.addColumn(
            'sites',
            'agreement',
            {
              type: Sequelize.DataTypes.TEXT,
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
        queryInterface.removeColumn('sites', 'agreement', {
          transaction: t,
        }),
      ]);
    });
  },
};
