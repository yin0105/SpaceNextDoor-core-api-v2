module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      // before removing, first check if column exists
      return queryInterface.describeTable('spaces').then(function (cols) {
        let promises = [];
        if (cols.third_party_provider) {
          promises = [
            queryInterface.removeColumn('spaces', 'third_party_provider', {transaction: t}),
            queryInterface.removeColumn('spaces', 'third_party_site_id', {transaction: t}),
            queryInterface.removeColumn('spaces', 'third_party_unit_type_id', {transaction: t})
          ];
        }

        if (!cols.third_party_space_id) {
          promises.push(
            queryInterface.addColumn(
              'spaces',
              'third_party_space_id',
              { type: Sequelize.DataTypes.STRING, allowNull: true, },
              { transaction: t },
            ),
          );
        }

        return Promise.all(promises);
      });
    });
  },
  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.addColumn(
          'spaces',
          'third_party_provider',
          {
            type: Sequelize.DataTypes.STRING,
          },
          { transaction: t },
        ),
        queryInterface.addColumn(
          'spaces',
          'third_party_site_id',
          {
            type: Sequelize.DataTypes.STRING,
          },
          { transaction: t },
        ),
        queryInterface.addColumn(
          'spaces',
          'third_party_unit_type_id',
          {
            type: Sequelize.DataTypes.STRING,
          },
          { transaction: t },
        ),
      ]);
    });
  },
};
