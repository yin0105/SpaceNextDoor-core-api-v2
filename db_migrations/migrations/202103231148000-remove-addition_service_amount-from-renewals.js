module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      const cols = await queryInterface.describeTable('renewals');
      if (cols.additional_services_amount) {
        await Promise.all([
          queryInterface.removeColumn('renewals', 'additional_services_amount', {
            transaction: t,
          }),
        ]);
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([]);
    });
  },
};
