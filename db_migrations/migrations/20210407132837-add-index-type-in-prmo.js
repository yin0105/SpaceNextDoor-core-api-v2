module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      try {
        await queryInterface.sequelize.query(`ALTER TYPE enum_promotions_customer_gets_for_type add value 'RENEWAL_INDEX'`, { t })
        await queryInterface.sequelize.query(`ALTER TYPE enum_bookings_promotions_customer_gets_for_type add value 'RENEWAL_INDEX'`, { t })
      } catch(_) {
        console.log('Type already have RENEWAL_INDEX')
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    return true;
  },
};
