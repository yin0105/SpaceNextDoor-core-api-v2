module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      // before creating, first check column doesn't exists
      const cols = await queryInterface.describeTable('sites')
      if (!cols.stock_management_type) {
        try {
          await queryInterface.sequelize.query(`DROP TYPE enum_sites_stock_management_type`)
        } catch(_) {
          console.log('Type does not exists')
        }
          
        await Promise.all([
          queryInterface.addColumn(
            'sites',
            'stock_management_type',
            {
              type: Sequelize.DataTypes.ENUM('SND', 'THIRD_PARTY'),
              defaultValue: 'SND',
              allowNull: false,
              index: true,
            },
            { transaction: t },
          ),
          queryInterface.addColumn(
            'sites',
            'third_party_provider',
            {
              type: Sequelize.DataTypes.STRING,
            },
            { transaction: t },
          ),
          queryInterface.addColumn(
            'sites',
            'third_party_site_id',
            {
              type: Sequelize.DataTypes.STRING,
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
        queryInterface.removeColumn('sites', 'stock_management_type', {
          transaction: t,
        }),
        queryInterface.removeColumn('sites', 'third_party_provider', {
          transaction: t,
        }),
        queryInterface.removeColumn('sites', 'third_party_site_id', {
          transaction: t,
        }),
        queryInterface.removeColumn('sites', 'third_party_unit_type_id', {
          transaction: t,
        }),
      ]);
    });
  },
};
