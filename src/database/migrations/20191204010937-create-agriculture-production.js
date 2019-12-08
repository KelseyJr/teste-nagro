module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('agriculture_productions', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      qty_hectares_planted: {
        type: Sequelize.DOUBLE,
        allowNull: false,
      },
      planting_year: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      planting_crop: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  down: queryInterface => {
    return queryInterface.dropTable('agriculture_productions');
  },
};
