import LivestockProduction from '../models/LivestockProduction';
import Farm from '../models/Farm';

import database from '../../database/index';

class LivestockProductionController {
  async index(req, res) {
    const {
      page = 1,
      per_page = 5,
      production_year,
      animals_species,
    } = req.query;

    const whereStatement = {};
    if (production_year) {
      whereStatement.production_year = production_year;
    }
    if (animals_species) {
      whereStatement.animals_species = animals_species;
    }

    const livestockProduction = await LivestockProduction.findAll({
      where: whereStatement,
      limit: per_page,
      offset: (page - 1) * per_page,
      include: [
        {
          model: Farm,
          attributes: [],
          as: 'farms',
          where: {
            user_id: req.userID,
          },
          through: {
            attributes: [],
          },
        },
      ],
    });

    return res.json(livestockProduction);
  }

  async show(req, res) {
    const { livestockProduction_id } = req.params;
    const livestockProduction = await LivestockProduction.findByPk(
      livestockProduction_id,
      {
        include: [
          {
            model: Farm,
            attributes: ['id', 'name', 'city', 'state'],
            as: 'farms',
            through: {
              attributes: [],
            },
          },
        ],
      }
    );

    return res.json(livestockProduction);
  }

  async store(req, res) {
    const transaction = await database.connection.transaction();
    try {
      const { farms, ...data } = req.body;

      const livestock = await LivestockProduction.create(data, { transaction });
      await livestock.setFarms(farms, { transaction });
      await transaction.commit();

      return res.json(livestock);
    } catch (err) {
      if (transaction) await transaction.rollback();

      throw new Error(err);
    }
  }

  async update(req, res) {
    const transaction = await database.connection.transaction();
    try {
      const { livestockProduction_id } = req.params;

      const livestock = await LivestockProduction.findByPk(
        livestockProduction_id
      );
      if (!livestock) {
        return res.status(400).json({ error: 'Livestock does not exists' });
      }

      const { farms, ...data } = req.body;
      if (farms && farms.length > 0) {
        await livestock.update(data, { transaction });
        await livestock.setFarms(farms, { transaction });
      } else {
        await livestock.update(data, { transaction });
      }

      await transaction.commit();

      return res.json(livestock);
    } catch (err) {
      if (transaction) await transaction.rollback();
      throw new Error(err);
    }
  }

  async delete(req, res) {
    const { livestockProduction_id } = req.params;
    const livestock = await LivestockProduction.findByPk(
      livestockProduction_id
    );

    if (!livestock) {
      return res.status(400).json({ error: 'Livestock does not exists' });
    }

    await livestock.destroy();

    return res.json();
  }
}

export default new LivestockProductionController();
