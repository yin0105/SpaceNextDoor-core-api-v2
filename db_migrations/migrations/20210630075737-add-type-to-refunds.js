'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      const cols = await queryInterface.describeTable('refunds');
      if (!cols.type) {
        await Promise.all([
          queryInterface.addColumn(
            'refunds',
            'type',
            {
              type: Sequelize.DataTypes.ENUM(
                'REFUND_CANCEL_BOOKING',
                'REFUND_DEPOSIT',
                'REFUND_UNUSED_DAYS',
              ),
              defaultValue: 'REFUND_CANCEL_BOOKING',
              allowNull: false,
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
        queryInterface.removeColumn('refunds', 'type', {
          transaction: t,
        }),
      ]);
    });
  },
};