import Sequelize, { Model } from 'sequelize';

class Farm extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        city: Sequelize.STRING,
        state: Sequelize.STRING,
        qty_hectares_land: Sequelize.DOUBLE,
        active: Sequelize.BOOLEAN,
      },
      {
        sequelize,
      }
    );
    return this;
  }

  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    this.belongsToMany(models.AgricultureProduction, {
      foreignKey: 'farm_id',
      through: 'farms_agriculture_productions',
      as: 'agricultureProduction',
    });
    this.belongsToMany(models.LivestockProduction, {
      foreignKey: 'farm_id',
      through: 'farms_livestock_productions',
      as: 'livestockProduction',
    });
  }
}

export default Farm;
