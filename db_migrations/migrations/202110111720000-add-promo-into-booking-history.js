'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      const cols = await queryInterface.describeTable('bookings_history');
      if (!cols.old_space_id) {
        await Promise.all([
          queryInterface.addColumn(
            'bookings_history',
            'old_space_id',
            {
              type: Sequelize.DataTypes.INTEGER,
              allowNull: true,
              references: {
                model:'spaces',
                key:'id',
              }
            },
            { transaction: t },
          ),
          queryInterface.addColumn(
            'bookings_history',
            'new_space_id',
            {
              type: Sequelize.DataTypes.INTEGER,
              allowNull: true,
              references: {
                model:'spaces',
                key:'id',
              }
            },
            { transaction: t },
          ),
          queryInterface.addColumn(
            'bookings_history',
            'promotion_id',
            {
              type: Sequelize.DataTypes.INTEGER,
              allowNull: true,
              references: {
                model:'promotions',
                key:'id',
              }
            },
            { transaction: t },
          ),
          queryInterface.addColumn(
            'bookings_history',
            'public_promotion_id',
            {
              type: Sequelize.DataTypes.INTEGER,
              allowNull: true,
              references: {
                model:'promotions',
                key:'id',
              }
            },
            { transaction: t },
          ),
          queryInterface.addColumn(
            'bookings_history',
            'old_deposit',
            {
              type: Sequelize.DataTypes.FLOAT,
              allowNull: true,
            },
            { transaction: t },
          ),
          queryInterface.addColumn(
            'bookings_history',
            'new_deposit',
            {
              type: Sequelize.DataTypes.FLOAT,
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
        queryInterface.removeColumn('bookings_history', 'old_space_id', {
          transaction: t,
        }),
        queryInterface.removeColumn('bookings_history', 'new_space_id', {
          transaction: t,
        }),
        queryInterface.removeColumn('bookings_history', 'promotion_id', {
          transaction: t,
        }),
        queryInterface.removeColumn('bookings_history', 'public_promotion_id', {
          transaction: t,
        }),
        queryInterface.removeColumn('bookings_history', 'old_deposit', {
          transaction: t,
        }),
        queryInterface.removeColumn('bookings_history', 'new_deposit', {
          transaction: t,
        }),
      ]);
    });
  }
};
