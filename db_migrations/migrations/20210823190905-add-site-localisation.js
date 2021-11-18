'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      const cols = await queryInterface.describeTable('sites');
      const nameFieldArray = ['name_en', 'name_th', 'name_jp', 'name_kr'];
      const descriptionFieldArray = [
        'description_en',
        'description_th',
        'description_jp',
        'description_kr',
      ];
      let promises = [];
      nameFieldArray.forEach((field) => {
        if (!cols[field]) {
          promises.push(
            queryInterface.addColumn(
              'sites',
              field,
              {
                type: Sequelize.DataTypes.STRING,
                allowNull: true,
                defaultValue: null,
              },
              { transaction: t },
            ),
          );
        }
      });
      descriptionFieldArray.forEach((field) => {
        if (!cols[field]) {
          promises.push(
            queryInterface.addColumn(
              'sites',
              field,
              {
                type: Sequelize.DataTypes.TEXT,
                allowNull: true,
                defaultValue: null,
              },
              { transaction: t },
            ),
          );
        }
      });

      promises.push(
        queryInterface.sequelize.query(
          'UPDATE "sites" SET name_en = name, name_th = name, name_jp = name, name_kr = name, description_en = description, description_th = description, description_jp = description, description_kr = description',
          { transaction: t },
        ),
      );

      await Promise.all(promises);
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      const nameFieldArray = ['name_en', 'name_th', 'name_jp', 'name_kr'];
      const descriptionFieldArray = [
        'description_en',
        'description_th',
        'description_jp',
        'description_kr',
      ];
      let promises = [];
      nameFieldArray.forEach((field) => {
        promises.push(
          queryInterface.removeColumn('sites', field, {
            transaction: t,
          }),
        );
      });
      descriptionFieldArray.forEach((field) => {
        promises.push(
          queryInterface.removeColumn('sites', field, {
            transaction: t,
          }),
        );
      });

      promises.push(
        queryInterface.sequelize.query(
          'UPDATE "sites" SET name_en = null, name_th = null, name_jp = null, name_kr = null, description_en = null, description_th = null, description_jp = null, description_kr = null',
          { transaction: t },
        ),
      );
      return Promise.all(promises);
    });
  },
};
