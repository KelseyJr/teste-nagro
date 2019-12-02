import request from 'supertest';
import app from '../../src/app';

import factory from '../factories';
import truncate from '../util/truncate';

describe('Create Farm', () => {
  beforeEach(async () => {
    await truncate();
  });

  it('should be able to create a farm', async () => {
    const user = await factory.create('User');
    const farm = await factory.attrs('Farm');

    const response = await request(app)
      .post('/farms')
      .set('Authorization', `Bearer ${user.generateToken()}`)
      .send(farm);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
  });

  it('should not be able to create a farm without jwt token', async () => {
    const farm = await factory.attrs('Farm');

    const response = await request(app)
      .post('/farms')
      .send(farm);

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({ error: 'Token is not provided' });
  });

  it('should not be able to update a user with invalid jwt token', async () => {
    const farm = await factory.attrs('Farm');

    const response = await request(app)
      .post('/farms')
      .set('Authorization', `Bearer 12348518`)
      .send(farm);

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({ error: 'Token invalid' });
  });

  it('should not be able to create a farm when required data is missing', async () => {
    const user = await factory.create('User');

    const response = await request(app)
      .post('/farms')
      .set('Authorization', `Bearer ${user.generateToken()}`)
      .send({
        name: '',
        city: '',
        state: '',
        qty_hectares_land: undefined,
      });

    expect(response.status).toBe(400);
    expect(response.body.messages[0].message).toBe('name is a required field');
    expect(response.body.messages[1].message).toBe('city is a required field');
    expect(response.body.messages[2].message).toBe('state is a required field');
    expect(response.body.messages[3].message).toBe(
      'qty_hectares_land is a required field'
    );
  });
});

describe('Update Farm', () => {
  beforeEach(async () => {
    await truncate();
  });

  it('should be able to update a farm', async () => {
    const user = await factory.create('User');
    const farm = await factory.create('Farm', {
      name: 'Teste',
      user_id: user.dataValues.id,
    });

    const response = await request(app)
      .put(`/farms/${farm.dataValues.id}`)
      .set('Authorization', `Bearer ${user.generateToken()}`)
      .send({
        ...farm.dataValues,
        name: 'Kelsey',
      });

    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Kelsey');
  });

  it('should not be able to update a farm without jwt token', async () => {
    const farm = await factory.create('Farm', {
      name: 'Teste',
    });

    const response = await request(app)
      .put(`/farms/${farm.dataValues.id}`)
      .send({
        ...farm.dataValues,
        name: 'Kelsey',
      });

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({ error: 'Token is not provided' });
  });

  it('should not be able to update a user with invalid jwt token', async () => {
    const farm = await factory.create('Farm', {
      name: 'Teste',
    });

    const response = await request(app)
      .put(`/farms/${farm.dataValues.id}`)
      .set('Authorization', `Bearer 1564515`)
      .send({
        ...farm.dataValues,
        name: 'Kelsey',
      });

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({ error: 'Token invalid' });
  });

  it('should not be able to update a farm when required data is missing', async () => {
    const user = await factory.create('User');
    const farm = await factory.create('Farm', {
      user_id: user.dataValues.id,
    });

    const response = await request(app)
      .put(`/farms/${farm.dataValues.id}`)
      .set('Authorization', `Bearer ${user.generateToken()}`)
      .send({
        name: '',
        city: '',
        state: '',
        qty_hectares_land: undefined,
      });

    expect(response.status).toBe(400);
    expect(response.body.messages[0].message).toBe('name is a required field');
    expect(response.body.messages[1].message).toBe('city is a required field');
    expect(response.body.messages[2].message).toBe('state is a required field');
    expect(response.body.messages[3].message).toBe(
      'qty_hectares_land is a required field'
    );
  });

  it('should not be able to update a farm when its not exists', async () => {
    const user = await factory.create('User');
    const farm = await factory.create('Farm', {
      name: 'Teste',
      user_id: user.dataValues.id,
    });

    const response = await request(app)
      .put(`/farms/1561`)
      .set('Authorization', `Bearer ${user.generateToken()}`)
      .send({
        ...farm.dataValues,
        name: 'Kelsey',
      });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ error: 'Farm does not exists' });
  });

  it('should be able to inactive a farm', async () => {
    const user = await factory.create('User');
    const farm = await factory.create('Farm', {
      user_id: user.dataValues.id,
    });

    const response = await request(app)
      .put(`/farms/${farm.dataValues.id}`)
      .set('Authorization', `Bearer ${user.generateToken()}`)
      .send({
        ...farm.dataValues,
        active: false,
      });

    expect(response.status).toBe(200);
    expect(response.body.active).toBeFalsy();
  });
});

describe('List all farms', () => {
  beforeEach(async () => {
    await truncate();
  });

  it('should be able to list all farms', async () => {
    const user = await factory.create('User');
    await factory.createMany('Farm', 5, {
      user_id: user.dataValues.id,
    });
    await factory.createMany('Farm', 2, {
      user_id: user.dataValues.id,
      active: false,
    });

    const response = await request(app)
      .get(`/farms?per_page=10`)
      .set('Authorization', `Bearer ${user.generateToken()}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(7);
  });

  it('should not be able to list all farms without jwt token', async () => {
    const user = await factory.create('User');
    await factory.createMany('Farm', 10, {
      user_id: user.dataValues.id,
    });

    const response = await request(app).get(`/farms`);

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({ error: 'Token is not provided' });
  });

  it('should not be able to list all farms with invalid jwt token', async () => {
    const user = await factory.create('User');
    await factory.createMany('Farm', 10, {
      user_id: user.dataValues.id,
    });

    const response = await request(app)
      .get(`/farms`)
      .set('Authorization', `Bearer 5556445`);

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({ error: 'Token invalid' });
  });

  it('should be able to list 10 farms per page', async () => {
    const user = await factory.create('User');
    await factory.createMany('Farm', 20, {
      user_id: user.dataValues.id,
    });

    const response = await request(app)
      .get(`/farms?per_page=10`)
      .set('Authorization', `Bearer ${user.generateToken()}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(10);
  });

  it('should be able to list all actives farms', async () => {
    const user = await factory.create('User');
    await factory.createMany('Farm', 5, {
      user_id: user.dataValues.id,
    });
    await factory.create('Farm', {
      user_id: user.dataValues.id,
      active: false,
    });

    const response = await request(app)
      .get(`/farms?per_page=10&active=true`)
      .set('Authorization', `Bearer ${user.generateToken()}`);

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(5);
  });

  it('should be able to list all inactives farms', async () => {
    const user = await factory.create('User');
    await factory.createMany('Farm', 5, {
      user_id: user.dataValues.id,
    });
    await factory.createMany('Farm', 2, {
      user_id: user.dataValues.id,
      active: false,
    });

    const response = await request(app)
      .get(`/farms?active=false&per_page=10`)
      .set('Authorization', `Bearer ${user.generateToken()}`);

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
  });
});

describe('List a single farm', () => {
  beforeEach(async () => {
    await truncate();
  });

  it('should be able to list a single farms', async () => {
    const user = await factory.create('User');
    const farm = await factory.create('Farm', {
      user_id: user.dataValues.id,
    });
    await factory.createMany('Farm', 10, {
      user_id: user.dataValues.id,
    });

    const response = await request(app)
      .get(`/farms/${farm.dataValues.id}`)
      .set('Authorization', `Bearer ${user.generateToken()}`);

    expect(response.status).toBe(200);
    expect(typeof response.body).toBe('object');
  });

  it('should not be able to list a farm without jwt token', async () => {
    const response = await request(app).get(`/farms`);

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({ error: 'Token is not provided' });
  });

  it('should not be able to list a farm with invalid jwt token', async () => {
    const response = await request(app)
      .get(`/farms`)
      .set('Authorization', `Bearer 5556445`);

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({ error: 'Token invalid' });
  });
});
