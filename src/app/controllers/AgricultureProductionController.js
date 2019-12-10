import AgricultureProduction from '../models/AgricultureProduction';
import Farm from '../models/Farm';

import database from '../../database/index';

class AgricultureProductionController {
  async index(req, res) {
    const { page = 1, per_page = 5, planting_year, planting_crop } = req.query;
    const whereStatement = {};
    if (planting_year) {
      whereStatement.planting_year = planting_year;
    }
    if (planting_crop) {
      whereStatement.planting_crop = planting_crop;
    }
    const agricultureProduction = await AgricultureProduction.findAll({
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

    return res.json(agricultureProduction);
  }

  async show(req, res) {
    const { agricultureProduction_id } = req.params;
    const agricultureProduction = await AgricultureProduction.findByPk(
      agricultureProduction_id,
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

    return res.json(agricultureProduction);
  }

  async store(req, res) {
    const transaction = await database.connection.transaction();
    try {
      const { farms, ...data } = req.body;
      const farm_lands = await Farm.sum('qty_hectares_land', {
        where: {
          id: farms,
        },
      });
      if (data.qty_hectares_planted > farm_lands) {
        return res.status(400).json({
          error:
            'Hectares planted is higher than sum of hectares land from farms ',
        });
      }

      const agricultureProduction = await AgricultureProduction.create(data, {
        transaction,
      });
      await agricultureProduction.setFarms(farms, {
        transaction,
      });
      await transaction.commit();

      return res.json(agricultureProduction);
    } catch (err) {
      if (transaction) await transaction.rollback();
      throw new Error(err);
    }
  }

  async update(req, res) {
    const transaction = await database.connection.transaction();
    try {
      const { agricultureProduction_id } = req.params;
      const agricultureProduction = await AgricultureProduction.findByPk(
        agricultureProduction_id
      );
      if (!agricultureProduction) {
        return res.status(400).json({ error: 'Production does not exists' });
      }

      const { farms, ...data } = req.body;
      if (farms && farms.length > 0) {
        const farm_lands = await Farm.sum('qty_hectares_land', {
          where: {
            id: farms,
          },
        });
        if (data.qty_hectares_planted > farm_lands) {
          return res.status(400).json({
            error:
              'Hectares planted is higher than sum of hectares land from farms ',
          });
        }
        await agricultureProduction.update(data, { transaction });
        await agricultureProduction.setFarms(farms, { transaction });
      } else {
        await agricultureProduction.update(data, { transaction });
      }

      await transaction.commit();
      return res.json(agricultureProduction);
    } catch (err) {
      if (transaction) await transaction.rollback();
      throw new Error(err);
    }
  }

  async delete(req, res) {
    const { agricultureProduction_id } = req.params;
    const agricultureProduction = await AgricultureProduction.findByPk(
      agricultureProduction_id
    );
    if (!agricultureProduction) {
      return res.status(400).json({ error: 'Production does not exists' });
    }

    await agricultureProduction.destroy();

    return res.json();
  }
}

export default new AgricultureProductionController();
