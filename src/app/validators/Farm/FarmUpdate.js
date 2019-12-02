import { object, string, number } from 'yup';

export default async (req, res, next) => {
  try {
    const schema = object().shape({
      name: string().required(),
      city: string().required(),
      state: string().required(),
      qty_hectares_land: number()
        .positive()
        .required(),
    });

    await schema.validate(req.body, { abortEarly: false });

    return next();
  } catch (err) {
    return res
      .status(400)
      .json({ error: 'Validations fails', messages: err.inner });
  }
};
