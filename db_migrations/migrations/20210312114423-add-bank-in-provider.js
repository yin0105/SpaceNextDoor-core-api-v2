module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      const cols = await queryInterface.describeTable('providers');
      if (!cols.bank_id) {
        await Promise.all([
          queryInterface.addColumn(
            'providers',
            'bank_id',
            {
              type: Sequelize.DataTypes.INTEGER,
              allowNull: true,
              references: {
                model: 'platform_banks',
                key: 'id',
              },
            },
            { transaction: t },
          ),
          queryInterface.addColumn(
            'providers',
            'bank_account_number',
            {
              type: Sequelize.DataTypes.STRING,
              allowNull: true,
            },
            { transaction: t },
          ),
          queryInterface.addColumn(
            'providers',
            'bank_account_holder_name',
            {
              type: Sequelize.DataTypes.STRING,
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
        queryInterface.removeColumn('providers', 'bank_id', {
          transaction: t,
        }),
        queryInterface.removeColumn('providers', 'bank_account_number', {
          transaction: t,
        }),
        queryInterface.removeColumn('providers', 'bank_account_holder_name', {
          transaction: t,
        }),
      ]);
    });
  },
};
