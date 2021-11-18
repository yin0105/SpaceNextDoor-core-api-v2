'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      const cols = await queryInterface.describeTable('users');
      if (!cols.preferred_language) {
        await Promise.all([
          queryInterface.addColumn(
            'users',
            'preferred_language',
            {
              type: Sequelize.DataTypes.STRING,
              allowNull: false,
              defaultValue: 'en-US',
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
        queryInterface.removeColumn('users', 'preferred_language', {
          transaction: t,
        }),
      ]);
    });
  },
};
