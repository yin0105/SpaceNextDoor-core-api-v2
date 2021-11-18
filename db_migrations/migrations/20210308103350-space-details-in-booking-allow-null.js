module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(async (t) => {
      await Promise.all([
        queryInterface.changeColumn(
          'bookings',
          'space_size_unit',
          {
            type: Sequelize.DataTypes.STRING,
            allowNull: true,
          },
          { transaction: t },
        ),
        queryInterface.changeColumn(
          'bookings',
          'space_size',
          {
            type: Sequelize.DataTypes.FLOAT,
            allowNull: true,
          },
          { transaction: t },
        ),
        queryInterface.changeColumn(
          'bookings',
          'space_height',
          {
            type: Sequelize.DataTypes.FLOAT,
            allowNull: true,
          },
          { transaction: t },
        ),
        queryInterface.changeColumn(
          'bookings',
          'space_length',
          {
            type: Sequelize.DataTypes.FLOAT,
            allowNull: true,
          },
          { transaction: t },
        ),
        queryInterface.changeColumn(
          'bookings',
          'space_width',
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
          'bookings',
          'space_size',
          {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: true,
          },
          { transaction: t },
        ),
        queryInterface.changeColumn(
          'bookings',
          'space_height',
          {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: true,
          },
          { transaction: t },
        ),
        queryInterface.changeColumn(
          'bookings',
          'space_width',
          {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: true,
          },
          { transaction: t },
        ),
        queryInterface.changeColumn(
          'bookings',
          'space_length',
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
