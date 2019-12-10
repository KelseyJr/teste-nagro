module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('livestock_productions', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      animals_species: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      production_year: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      qty_animals: {
        type: Sequelize.INTEGER,
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
    return queryInterface.dropTable('livestock_productions');
  },
};
