'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      const cols = await queryInterface.describeTable('bookings');
      if (!cols.review_status) {
        await Promise.all([
          queryInterface.addColumn(
            'bookings',
            'review_status',
            {
              type: Sequelize.DataTypes.ENUM(
                'SCHEDULED',
                'REMINDED',
                'REVIEWED',
              ),
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
        queryInterface.removeColumn('bookings', 'review_status', {
          transaction: t,
        }),
        queryInterface.sequelize.query(
          'DROP TYPE IF EXISTS "enum_bookings_review_status";',
        ),
      ]);
    });
  },
};
