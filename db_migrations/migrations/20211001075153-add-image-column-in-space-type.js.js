'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      const cols = await queryInterface.describeTable('platform_space_types');
      if (!cols.image) {
        await queryInterface.addColumn(
          'platform_space_types',
          'image',
          {
            type: Sequelize.DataTypes.TEXT,
            allowNull: false,
            defaultValue: '',
          },
          { transaction: t },
        );
        
        await queryInterface.sequelize.query(
          'UPDATE "platform_space_types" SET image = icon',
          { transaction: t },
        );
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return queryInterface.removeColumn('platform_space_types', 'image', {
        transaction: t,
      });
    });
  },
};
