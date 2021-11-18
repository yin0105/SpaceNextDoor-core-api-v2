module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      const cols = await queryInterface.describeTable('site_addresses')
      try {
        // Creates postgis extension which is necessary for this
        await queryInterface.sequelize.query('CREATE EXTENSION postgis;');
      } catch (e) {
        console.log(e.message, 'Extension already exists!');
      }

      if (!cols.point) {
        await Promise.all([
          queryInterface.addColumn(
            'site_addresses',
            'point',
            {
              type: Sequelize.DataTypes.GEOMETRY('POINT'),
              allowNull: true,
              index: true,
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
        queryInterface.removeColumn('site_addresses', 'point', {
          transaction: t,
        }),
      ]);
    });
  },
};
