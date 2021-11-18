'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      const cols = await queryInterface.describeTable('renewals');
      if (!cols.next_renewal_sub_total) {
        await Promise.all([
          queryInterface.addColumn(
            'renewals',
            'next_renewal_sub_total',
            {
              type: Sequelize.DataTypes.FLOAT,
              allowNull: true,
              defaultValue: null,
            },
            { transaction: t },
          ),
          queryInterface.addColumn(
            'renewals',
            'next_renewal_total',
            {
              type: Sequelize.DataTypes.FLOAT,
              allowNull: true,
              defaultValue: null,
            },
            { transaction: t },
          ),
          queryInterface.addColumn(
            'renewals',
            'next_renewal_discount',
            {
              type: Sequelize.DataTypes.FLOAT,
              allowNull: true,
              defaultValue: null,
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
        queryInterface.removeColumn('renewals', 'next_renewal_sub_total', {
          transaction: t,
        }),
        queryInterface.removeColumn('renewals', 'next_renewal_total', {
          transaction: t,
        }),
        queryInterface.removeColumn('renewals', 'next_renewal_discount', {
          transaction: t,
        }),
      ]);
    });
  },
};
