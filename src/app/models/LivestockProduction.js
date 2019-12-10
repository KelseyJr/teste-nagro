import Sequelize, { Model } from 'sequelize';

class LivestockProduction extends Model {
  static init(sequelize) {
    super.init(
      {
        qty_animals: Sequelize.INTEGER,
        production_year: Sequelize.INTEGER,
        animals_species: Sequelize.STRING,
      },
      {
        sequelize,
      }
    );
    return this;
  }

  static associate(models) {
    this.belongsToMany(models.Farm, {
      foreignKey: 'livestock_production_id',
      through: 'farms_livestock_productions',
      as: 'farms',
    });
  }
}

export default LivestockProduction;
