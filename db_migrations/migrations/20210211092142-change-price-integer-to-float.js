module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      // before creating, first check column doesn't exists
      await Promise.all([
        queryInterface.changeColumn(
          'prices',
          'price_per_day',
          {
            type: Sequelize.DataTypes.FLOAT,
            allowNull: true,
          },
          { transaction: t },
        ),
        queryInterface.changeColumn(
          'prices',
          'price_per_week',
          {
            type: Sequelize.DataTypes.FLOAT,
            allowNull: true,
          },
          { transaction: t },
        ),
        queryInterface.changeColumn(
          'prices',
          'price_per_month',
          {
            type: Sequelize.DataTypes.FLOAT,
            allowNull: true,
          },
          { transaction: t },
        ),
        queryInterface.changeColumn(
          'prices',
          'price_per_year',
          {
            type: Sequelize.DataTypes.FLOAT,
            allowNull: true,
          },
          { transaction: t },
        ),
      ]);
    });
  },
  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction((t) => {
      return Promise.all([
        queryInterface.changeColumn(
          'prices',
          'price_per_day',
          {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: true,
          },
          { transaction: t },
        ),
        queryInterface.changeColumn(
          'prices',
          'price_per_week',
          {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: true,
          },
          { transaction: t },
        ),
        queryInterface.changeColumn(
          'prices',
          'price_per_month',
          {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: true,
          },
          { transaction: t },
        ),
        queryInterface.changeColumn(
          'prices',
          'price_per_year',
          {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: true,
          },
          { transaction: t },
        ),
      ]);
    });
  },
};
