module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      const cols = await queryInterface.describeTable('bookings');
      if (!cols.cancellation_reason_id) {
        await Promise.all([
          queryInterface.addColumn(
            'bookings',
            'cancellation_reason_id',
            {
              type: Sequelize.DataTypes.INTEGER,
              allowNull: true,
              index: true,
              references: {
                model: 'booking_cancellation_reasons',
                key: 'id',
              },
            },
            { transaction: t },
          ),
          queryInterface.addColumn(
            'bookings',
            'cancellation_reason_note',
            {
              type: Sequelize.DataTypes.TEXT,
              allowNull: true,
              index: false,
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
        queryInterface.removeColumn('bookings', 'cancellation_reason_id', {
          transaction: t,
        }),
        queryInterface.removeColumn('bookings', 'cancellation_reason_note', {
          transaction: t,
        }),
      ]);
    });
  },
};
