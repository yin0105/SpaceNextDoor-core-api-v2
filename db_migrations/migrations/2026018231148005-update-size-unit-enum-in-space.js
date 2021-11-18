module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      try {
         await queryInterface.sequelize.query(
           `ALTER TYPE enum_spaces_size_unit add value 'tatami'`,
           { t },
         );
        await queryInterface.sequelize.query(
          `ALTER TYPE enum_platform_space_types_unit add value 'tatami'`,
          { t },
        );
        await queryInterface.sequelize.query(
          `ALTER TYPE enum_bookings_space_size_unit add value 'tatami'`,
          { t },
        );
      } catch (_) {
        console.log('Type enum_spaces_size_unit already have tatami');
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    return true;
  },
};
