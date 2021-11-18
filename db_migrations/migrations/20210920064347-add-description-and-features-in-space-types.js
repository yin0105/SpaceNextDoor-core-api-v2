'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      const cols = await queryInterface.describeTable('platform_space_types');
      const descriptionFieldArray = [
        'description_en',
        'description_th',
        'description_jp',
        'description_kr',
      ];
      let promises = [];
      descriptionFieldArray.forEach((field) => {
        if (!cols[field]) {
          promises.push(
            queryInterface.addColumn(
              'platform_space_types',
              field,
              {
                type: Sequelize.DataTypes.TEXT,
                allowNull: false,
                defaultValue: '',
              },
              { transaction: t },
            ),
          );
        }
      });

      await Promise.all(promises);
    });
  },

  down: async (queryInterface, Sequelize) => {
    return true
  }
};
