const replaceEnum = require('sequelize-replace-enum-postgres').default;

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return replaceEnum({
      queryInterface,
      tableName: 'platform_features',
      columnName: 'type',
      newValues: [
        'SITE',
        'SPACE',
        'SPACE_TYPE'
      ],
      enumName: 'enum_platform_features_type',
    });
  },
  down: async (queryInterface, Sequelize) => {
    return true;
  },
};
