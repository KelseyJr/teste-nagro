import faker from 'faker';
import { factory } from 'factory-girl';

import { generate as generateCPF } from 'gerador-validador-cpf';
import User from '../src/app/models/User';
import Farm from '../src/app/models/Farm';

factory.define('User', User, {
  name: faker.name.findName(),
  cpf: generateCPF(),
  email: faker.internet.email(),
  password: faker.internet.password(),
});

factory.define('Farm', Farm, {
  name: faker.name.findName(),
  city: faker.address.city(),
  state: faker.address.state(),
  qty_hectares_land: faker.random.number({
    min: 1,
    max: 100,
    precision: 2 ** -1,
  }),
});

export default factory;
