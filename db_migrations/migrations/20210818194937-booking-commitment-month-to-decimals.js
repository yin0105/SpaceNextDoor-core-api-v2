'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      const cols = await queryInterface.describeTable('bookings');
      if (cols.commitment_months?.type === 'INTEGER') {
        await Promise.all([
          queryInterface.changeColumn(
            'bookings',
            'commitment_months',
            {
              type: Sequelize.DataTypes.FLOAT,
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
      return Promise.all([
        queryInterface.changeColumn(
          'bookings',
          'commitment_months',
          {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null,
          },
          { transaction: t },
        ),
      ]);
    });
  },
};
