import { object, string, ref } from 'yup';

export default async (req, res, next) => {
  try {
    const schema = object().shape({
      name: string().required(),
      email: string()
        .email()
        .required(),
      cpf: string()
        .length(14)
        .required(),
      oldPassword: string(),
      password: string().when('oldPassword', (oldPassword, field) =>
        oldPassword ? field.required() : field
      ),
      confirmPassword: string().when('password', (password, field) =>
        password ? field.required().oneOf([ref('password')]) : field
      ),
    });

    await schema.validate(req.body, { abortEarly: false });

    return next();
  } catch (err) {
    return res
      .status(400)
      .json({ error: 'Validations fails', messages: err.inner });
  }
};
