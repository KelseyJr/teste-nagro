import { Op } from 'sequelize';
import Farm from '../models/Farm';

class FarmController {
  async index(req, res) {
    const { page = 1, per_page = 5, active } = req.query;

    const farm = await Farm.findAll({
      where: {
        user_id: req.userID,
        active: active !== undefined ? active : { [Op.or]: [true, false] },
      },
      limit: per_page,
      offset: (page - 1) * per_page,
      attributes: [
        'id',
        'name',
        'city',
        'state',
        'qty_hectares_land',
        'active',
        'created_at',
      ],
    });

    return res.json(farm);
  }

  async show(req, res) {
    const { id_farm } = req.params;
    const farm = await Farm.findByPk(id_farm, {
      attributes: [
        'id',
        'name',
        'city',
        'state',
        'qty_hectares_land',
        'active',
        'created_at',
      ],
    });

    return res.json(farm);
  }

  async store(req, res) {
    const farm = await Farm.create({
      ...req.body,
      user_id: req.userID,
    });

    return res.json(farm);
  }

  async update(req, res) {
    const { id_farm } = req.params;
    const farm = await Farm.findByPk(id_farm);

    if (!farm) {
      return res.status(400).json({ error: 'Farm does not exists' });
    }

    await farm.update(req.body);
    return res.json(farm);
  }
}

export default new FarmController();
