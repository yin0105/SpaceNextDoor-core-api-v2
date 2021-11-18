module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      try {
         await queryInterface.sequelize.query(
           `ALTER TYPE enum_sites_stock_management_type add value 'AFFILIATE'`,
           { t },
         );
        await queryInterface.sequelize.query(
          `ALTER TYPE enum_spaces_stock_management_type add value 'AFFILIATE'`,
          { t },
        );
      } catch (_) {
        console.log(
          'Type stock_management_type already have AFFILIATE',
        );
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    return true;
  },
};
