'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      const bookingsHistoryCols = await queryInterface.describeTable('bookings_history');
      if (!bookingsHistoryCols.old_base_amount) {
        await Promise.all([
          queryInterface.addColumn(
            'bookings_history',
            'old_base_amount',
            {
              type: Sequelize.DataTypes.FLOAT,
              allowNull: true,
            },
            { transaction: t },
          ),
          queryInterface.addColumn(
            'bookings_history',
            'base_amount',
            {
              type: Sequelize.DataTypes.FLOAT,
              allowNull: true,
            },
            { transaction: t },
          ),
          queryInterface.addColumn(
            'bookings_history',
            'old_insurance_id',
            {
              type: Sequelize.DataTypes.INTEGER,
              allowNull: true,
              references: {
                model: 'platform_insurances',
                key: 'id',
              },
              defaultValue: null,
            },
            { transaction: t },
          ),
          queryInterface.addColumn(
            'bookings_history',
            'insurance_id',
            {
              type: Sequelize.DataTypes.INTEGER,
              allowNull: true,
              references: {
                model: 'platform_insurances',
                key: 'id',
              },
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
        queryInterface.removeColumn('bookings_history', 'old_base_amount', {
          transaction: t,
        }),
        queryInterface.removeColumn('bookings_history', 'base_amount', {
          transaction: t,
        }),
        queryInterface.removeColumn('bookings_history', 'old_insurance_id', {
          transaction: t,
        }),
        queryInterface.removeColumn('bookings_history', 'insurance_id', {
          transaction: t,
        }),
      ]);
    });
  },
};
