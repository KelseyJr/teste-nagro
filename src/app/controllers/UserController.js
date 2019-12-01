import {
  validate as validateCPF,
  format as formatCPF,
} from 'gerador-validador-cpf';
import User from '../models/User';

class UserController {
  async store(req, res) {
    const { name, email } = req.body;
    let { cpf } = req.body;

    const checkEmail = await User.findOne({ where: { email } });
    if (checkEmail) {
      return res.status(400).json({ error: 'Duplicated email' });
    }

    if (!validateCPF(cpf)) {
      return res.status(400).json({ error: 'Not a valid CPF' });
    }
    cpf = formatCPF(cpf, 'digits');
    const checkCPF = await User.findOne({ where: { cpf } });
    if (checkCPF) {
      return res.status(400).json({ error: 'Duplicated CPF' });
    }

    const { id } = await User.create({
      ...req.body,
      cpf,
    });

    return res.json({
      id,
      name,
      email,
      cpf,
    });
  }

  async update(req, res) {
    const user = await User.findByPk(req.userID);
    const { email, oldPassword } = req.body;
    let { cpf } = req.body;

    if (user.email !== email) {
      const userExists = await User.findOne({ where: { email } });
      if (userExists) {
        return res.status(400).json({ error: 'Email already exists' });
      }
    }

    if (!validateCPF(cpf)) {
      return res.status(400).json({ error: 'Not a valid CPF' });
    }
    cpf = formatCPF(cpf, 'digits');
    if (user.cpf !== cpf) {
      const userExists = await User.findOne({ where: { cpf } });
      if (userExists) {
        return res.status(400).json({ error: 'CPF already exists' });
      }
    }

    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(400).json({ error: 'Password does not match' });
    }

    const { id, name } = await user.update({
      ...req.body,
      cpf,
    });

    return res.json({
      id,
      name,
      email,
      cpf,
    });
  }
}

export default new UserController();
