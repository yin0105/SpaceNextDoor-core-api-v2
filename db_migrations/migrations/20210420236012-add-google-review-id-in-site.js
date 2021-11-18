module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      const cols = await queryInterface.describeTable('sites');
      if (!cols.google_reviews_widget_id) {
        await Promise.all([
          queryInterface.addColumn(
            'sites',
            'google_reviews_widget_id',
            {
              type: Sequelize.DataTypes.TEXT,
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
        queryInterface.removeColumn('sites', 'google_reviews_widget_id', {
          transaction: t,
        }),
      ]);
    });
  },
};
