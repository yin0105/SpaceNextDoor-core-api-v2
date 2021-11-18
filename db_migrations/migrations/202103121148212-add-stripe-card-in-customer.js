module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      const cols = await queryInterface.describeTable('customers');
      if (!cols.stripe_customer_id) {
        await Promise.all([
          queryInterface.addColumn(
            'customers',
            'stripe_customer_id',
            {
              type: Sequelize.DataTypes.STRING,
              allowNull: true,
            },
            { transaction: t },
          ),
          queryInterface.addColumn(
            'customers',
            'card_last_digits',
            {
              type: Sequelize.DataTypes.STRING,
              allowNull: true,
            },
            { transaction: t },
          ),
          queryInterface.addColumn(
            'customers',
            'card_brand_name',
            {
              type: Sequelize.DataTypes.STRING,
              allowNull: true,
            },
            { transaction: t },
          ),
          queryInterface.addColumn(
            'customers',
            'card_holder_name',
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
        queryInterface.removeColumn('customers', 'stripe_customer_id', {
          transaction: t,
        }),
        queryInterface.removeColumn('customers', 'card_last_digits', {
          transaction: t,
        }),
        queryInterface.removeColumn('customers', 'card_brand_name', {
          transaction: t,
        }),
        queryInterface.removeColumn('customers', 'card_holder_name', {
          transaction: t,
        }),
      ]);
    });
  },
};
