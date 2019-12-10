import { object, string, number, array } from 'yup';

export default async (req, res, next) => {
  try {
    const schema = object().shape({
      qty_animals: number()
        .positive()
        .required(),
      production_year: number()
        .positive()
        .required(),
      animals_species: string().required(),
      farms: array()
        .of(number())
        .min(1)
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
