'use strict';

module.exports = {
    up: async(queryInterface, Sequelize) => {
        return queryInterface.sequelize.transaction(async(t) => {
            const cols = await queryInterface.describeTable('bookings_promotions');
            if (!cols.applied_at) {
                await queryInterface.addColumn(
                    'bookings_promotions',
                    'applied_at', {
                        type: Sequelize.DataTypes.DATE,
                        allowNull: true,
                        defaultValue: null,
                    }, { transaction: t },
                );

                await queryInterface.sequelize.query(
                    'UPDATE "bookings_promotions" SET applied_at = created_at', { transaction: t },
                );
            }
        });
    },

    down: async(queryInterface, Sequelize) => {
        return queryInterface.sequelize.transaction((t) => {
            return Promise.all([
                queryInterface.removeColumn('bookings_promotions', 'applied_at', {
                    transaction: t,
                }),
            ]);
        });
    }
};