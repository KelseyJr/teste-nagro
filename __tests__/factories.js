import faker from 'faker';
import { factory } from 'factory-girl';

import { generate as generateCPF } from 'gerador-validador-cpf';
import User from '../src/app/models/User';

factory.define('User', User, {
  name: faker.name.findName(),
  cpf: generateCPF(),
  email: faker.internet.email(),
  password: faker.internet.password(),
});

export default factory;
