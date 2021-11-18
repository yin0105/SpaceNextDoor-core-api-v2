'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      const cols = await queryInterface.describeTable('sites');
      if (!cols.source_site_name) {
        await Promise.all([
          queryInterface.addColumn(
            'sites',
            'source_site_name',
            {
              type: Sequelize.DataTypes.TEXT,
              defaultValue: null,
            },
            { transaction: t },
          ),
          queryInterface.addColumn(
            'sites',
            'source_site_link',
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
        queryInterface.removeColumn('sites', 'source_site_name', {
          transaction: t,
        }),
        queryInterface.removeColumn('sites', 'source_site_link', {
          transaction: t,
        }),
      ]);
    });
  },
};
