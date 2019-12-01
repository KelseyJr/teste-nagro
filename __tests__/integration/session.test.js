import request from 'supertest';
import app from '../../src/app';

import factory from '../factories';
import truncate from '../util/truncate';

describe('Session', () => {
  beforeEach(async () => {
    await truncate();
  });

  it('should not authenticated with invalid email', async () => {
    const user = await factory.create('User', {
      email: 'teste@teste.com',
    });

    const response = await request(app)
      .post('/sessions')
      .send({
        email: 'teste2@teste.com',
        password: user.dataValues.password,
      });

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({ error: 'User not found' });
  });

  it('should not authenticated with invalid password', async () => {
    const user = await factory.create('User', {
      password: '123456',
    });

    const response = await request(app)
      .post('/sessions')
      .send({
        email: user.dataValues.email,
        password: '12345',
      });

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({ error: 'Password does not match' });
  });

  it('should return a JWT token when authenticated', async () => {
    const user = await factory.create('User');

    const response = await request(app)
      .post('/sessions')
      .send({
        email: user.dataValues.email,
        password: user.dataValues.password,
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });

  it('should not create a session when required data is missing', async () => {
    const response = await request(app)
      .post('/sessions')
      .send({
        email: '',
        password: '',
      });

    expect(response.status).toBe(400);
    expect(response.body.messages[0].message).toBe('email is a required field');
    expect(response.body.messages[1].message).toBe(
      'password is a required field'
    );
  });
});
