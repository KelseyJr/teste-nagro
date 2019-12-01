import request from 'supertest';
import app from '../../src/app';

import factory from '../factories';
import truncate from '../util/truncate';

describe('Register User', () => {
  beforeEach(async () => {
    await truncate();
  });

  it('should be able to register', async () => {
    const user = await factory.attrs('User');
    const response = await request(app)
      .post('/users')
      .send(user);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
  });

  it('should not be able to register a user with duplicated email', async () => {
    const user = await factory.attrs('User');

    await request(app)
      .post('/users')
      .send(user);

    const response = await request(app)
      .post('/users')
      .send(user);

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ error: 'Duplicated email' });
  });

  it('should not be able to register a user with duplicated CPF', async () => {
    const user = await factory.attrs('User');

    await request(app)
      .post('/users')
      .send(user);

    user.email = 'teste@teste.com';

    const response = await request(app)
      .post('/users')
      .send(user);

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ error: 'Duplicated CPF' });
  });

  it('should not be able to create a user when required data is missing', async () => {
    const response = await request(app)
      .post('/users')
      .send({
        name: '',
        email: '',
        cpf: undefined,
        password: '',
      });

    expect(response.status).toBe(400);
    expect(response.body.messages[0].message).toBe('name is a required field');
    expect(response.body.messages[1].message).toBe('email is a required field');
    expect(response.body.messages[2].message).toBe('cpf is a required field');
    expect(response.body.messages[3].message).toBe(
      'password is a required field'
    );
  });

  it('should not be able to create a user with invalid CPF', async () => {
    const user = await factory.attrs('User', {
      cpf: '123.456.789-01',
    });
    const response = await request(app)
      .post('/users')
      .send(user);

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ error: 'Not a valid CPF' });
  });
});

describe('Update User', () => {
  beforeEach(async () => {
    await truncate();
  });

  it('should be able to update a user when authenticated', async () => {
    const user = await factory.create('User');

    const response = await request(app)
      .put('/users')
      .set('Authorization', `Bearer ${user.generateToken()}`)
      .send({
        name: 'Kelsey',
        email: user.dataValues.email,
        cpf: user.dataValues.cpf,
      });

    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Kelsey');
  });

  it('should not be able to update a user without jwt token', async () => {
    const user = await factory.create('User');

    const response = await request(app)
      .put('/users')
      .send({
        ...user.dataValues,
        name: 'Kelsey',
      });

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({ error: 'Token is not provided' });
  });

  it('should not be able to update a user with invalid jwt token', async () => {
    const user = await factory.create('User');

    const response = await request(app)
      .put('/users')
      .set('Authorization', `Bearer 123456`)
      .send({
        ...user.dataValues,
        name: 'Kelsey',
      });

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({ error: 'Token invalid' });
  });

  it('should not be able to update a user with duplicated email', async () => {
    const user = await factory.create('User', {
      email: 'teste@teste.com',
      cpf: '714.107.000-11',
    });
    const user2 = await factory.create('User', {
      email: 'teste2@teste.com',
      cpf: '081.351.363-40',
    });

    const response = await request(app)
      .put('/users')
      .set('Authorization', `Bearer ${user.generateToken()}`)
      .send({
        name: user.dataValues.name,
        email: user2.dataValues.email,
        cpf: user.dataValues.cpf,
      });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ error: 'Email already exists' });
  });

  it('should not be able to update a user with duplicated CPF', async () => {
    const user = await factory.attrs('User', {
      email: 'teste@teste.com',
      cpf: '373.532.473-80',
    });
    await request(app)
      .post('/users')
      .send(user);

    const user2 = await factory.create('User', {
      email: 'teste2@teste.com',
      cpf: '532.501.318-14',
    });

    const response = await request(app)
      .put('/users')
      .set('Authorization', `Bearer ${user2.generateToken()}`)
      .send({
        name: user2.dataValues.name,
        email: user2.dataValues.email,
        cpf: user.cpf,
      });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ error: 'CPF already exists' });
  });

  it('should not be able to update a password from user when oldPassword is wrong', async () => {
    const user = await factory.create('User', {
      password: '123',
    });

    const response = await request(app)
      .put('/users')
      .set('Authorization', `Bearer ${user.generateToken()}`)
      .send({
        ...user.dataValues,
        oldPassword: '1234',
        password: '12345',
        confirmPassword: '12345',
      });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ error: 'Password does not match' });
  });

  it('should not be able to update a password from user when password and confirmPassword are wrong', async () => {
    const user = await factory.create('User', {
      password: '123',
    });

    const response = await request(app)
      .put('/users')
      .set('Authorization', `Bearer ${user.generateToken()}`)
      .send({
        ...user.dataValues,
        oldPassword: '123',
        password: '12345',
        confirmPassword: '12344',
      });

    expect(response.status).toBe(400);
  });

  it('should not be able to update a password when oldPassword  not given', async () => {
    const user = await factory.create('User', {
      password: '123',
    });

    const response = await request(app)
      .put('/users')
      .set('Authorization', `Bearer ${user.generateToken()}`)
      .send({
        ...user.dataValues,
        oldPassword: '',
        password: '',
        confirmPassword: '',
      });

    expect(response.status).toBe(200);
    expect(await user.checkPassword('123', response.body.password_hash)).toBe(
      true
    );
  });

  it('should not be able to update a user with invalid CPF', async () => {
    const user = await factory.create('User');

    const response = await request(app)
      .put('/users')
      .set('Authorization', `Bearer ${user.generateToken()}`)
      .send({
        ...user.dataValues,
        cpf: '111.111.111-11',
        password: '',
      });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ error: 'Not a valid CPF' });
  });
});
