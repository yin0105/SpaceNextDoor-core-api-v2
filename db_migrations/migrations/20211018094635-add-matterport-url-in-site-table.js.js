'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      const cols = await queryInterface.describeTable('sites');
      if (!cols.url_3d) {
        await Promise.all([
          queryInterface.addColumn(
            'sites',
            'url_3d',
            {
              type: Sequelize.DataTypes.ARRAY(Sequelize.DataTypes.JSON),
              allowNull: true,
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
      return queryInterface.removeColumn('sites', 'url_3d', {
        transaction: t,
      });
    });
  },
};
