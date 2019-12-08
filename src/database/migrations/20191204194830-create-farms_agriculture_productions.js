module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('farms_agriculture_productions', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      agriculture_production_id: {
        type: Sequelize.INTEGER,
        references: { model: 'agriculture_productions', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        allowNull: true,
      },
      farm_id: {
        type: Sequelize.INTEGER,
        references: { model: 'farms', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        allowNull: true,
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
    return queryInterface.dropTable('farms_agriculture_productions');
  },
};
