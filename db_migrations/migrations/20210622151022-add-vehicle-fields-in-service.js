'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      const cols = await queryInterface.describeTable('platform_services');
      if (!cols.vehicle_title) {
        await Promise.all([
          queryInterface.addColumn(
            'platform_services',
            'vehicle_title',
            {
              type: Sequelize.DataTypes.STRING,
              defaultValue: null,
              allowNull: true,
            },
            { transaction: t },
          ),
          queryInterface.addColumn(
            'platform_services',
            'max_weight',
            {
              type: Sequelize.DataTypes.FLOAT,
              defaultValue: null,
              allowNull: true,
            },
            { transaction: t },
          ),
          queryInterface.addColumn(
            'platform_services',
            'weight_unit',
            {
              type: Sequelize.DataTypes.STRING,
              defaultValue: null,
              allowNull: true,
            },
            { transaction: t },
          ),
          queryInterface.addColumn(
            'platform_services',
            'size_from',
            {
              type: Sequelize.DataTypes.STRING,
              defaultValue: null,
              allowNull: true,
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
        queryInterface.removeColumn('platform_services', 'vehicle_title', {
          transaction: t,
        }),
        queryInterface.removeColumn('platform_services', 'max_weight', {
          transaction: t,
        }),
        queryInterface.removeColumn('platform_services', 'weight_unit', {
          transaction: t,
        }),
        queryInterface.removeColumn('platform_services', 'size_from', {
          transaction: t,
        }),
      ]);
    });
  },
};
