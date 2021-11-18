const replaceEnum = require('sequelize-replace-enum-postgres').default;

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return replaceEnum({
      queryInterface,
      tableName: 'transactions',
      columnName: 'type',
      defaultValue: 'BOOKING',
      newValues: [
        'BOOKING',
        'ORDER',
        'BOOKING_ORDER',
        'TERMINATION',
        'RENEWAL',
        'REFUND_CANCEL_BOOKING',
        'REFUND_DEPOSIT',
        'REFUND_UNUSED_DAYS',
      ],
      enumName: 'enum_transactions_type',
    });
  },
  down: async (queryInterface, Sequelize) => {
    return true;
  },
};
