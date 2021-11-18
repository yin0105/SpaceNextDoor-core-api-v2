'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      const citiesCols = await queryInterface.describeTable('cities');
      if (!citiesCols.temp_name) {
        await Promise.all([
          queryInterface.addColumn(
            'cities',
            'temp_name',
            {
              type: Sequelize.DataTypes.STRING,
              allowNull: true,
            },
            { transaction: t },
          ),
        ]);

        await queryInterface.sequelize.query(
          'UPDATE "cities" SET temp_name = name_jp',
          { transaction: t },
        );
      }

      const districtsCols = await queryInterface.describeTable('districts');
      if (!districtsCols.temp_name) {
        await Promise.all([
          queryInterface.addColumn(
            'districts',
            'temp_name',
            {
              type: Sequelize.DataTypes.STRING,
              allowNull: true,
            },
            { transaction: t },
          ),
        ]);

        await queryInterface.sequelize.query(
          'UPDATE "districts" SET temp_name = name_jp',
          { transaction: t },
        );
      }
      
    });
    
  },
  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn('districts', 'temp_name', {
          transaction: t,
        }),
        queryInterface.removeColumn('cities', 'temp_name', {
          transaction: t,
        }),
      ]);
    });
  },
};
