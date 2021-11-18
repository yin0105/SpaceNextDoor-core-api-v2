'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      const cols = await queryInterface.describeTable('bookings');
      if (!cols.original_base_amount) {
        await Promise.all([
          queryInterface.addColumn(
            'bookings',
            'original_base_amount',
            {
              type: Sequelize.DataTypes.FLOAT,
              allowNull: false, 
              defaultValue: 0,                          
            },          
            { transaction: t },
          ),
          queryInterface.sequelize.query(
            'UPDATE "bookings" SET original_base_amount=base_amount',
            { transaction: t },
          ),
        ]);
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.removeColumn('bookings', 'original_base_amount', {
          transaction: t,
        }),
      ]);
    });
  }
};
