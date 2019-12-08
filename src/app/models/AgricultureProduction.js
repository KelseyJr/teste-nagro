import Sequelize, { Model } from 'sequelize';

class AgricultureProduction extends Model {
  static init(sequelize) {
    super.init(
      {
        qty_hectares_planted: Sequelize.DOUBLE,
        planting_year: Sequelize.INTEGER,
        planting_crop: Sequelize.STRING,
      },
      {
        sequelize,
      }
    );
    return this;
  }

  static associate(models) {
    this.belongsToMany(models.Farm, {
      foreignKey: 'agriculture_production_id',
      through: 'farms_agriculture_productions',
      as: 'farms',
    });
  }
}

export default AgricultureProduction;
