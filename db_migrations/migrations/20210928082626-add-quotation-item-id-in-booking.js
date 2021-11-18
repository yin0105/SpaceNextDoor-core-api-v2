'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      const cols = await queryInterface.describeTable('bookings');
      if (!cols.quotation_item_id) {
        await Promise.all([
          queryInterface.addColumn(
            'bookings',
            'quotation_item_id',
            {
              type: Sequelize.DataTypes.INTEGER,
              allowNull: true,
              index:true,
              references: {
                model:'quotations_items',
                key:'id',
              }
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
        queryInterface.removeColumn('bookings', 'quotation_item_id', {
          transaction: t,
        }),
      ]);
    });
  }
};
