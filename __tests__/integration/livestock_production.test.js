import request from 'supertest';
import app from '../../src/app';

import factory from '../factories';
import truncate from '../util/truncate';

describe('Create Livestock Production', () => {
  beforeEach(async () => {
    await truncate();
  });

  it('should be able to create a new livestock production', async () => {
    const user = await factory.create('User');
    const farms = await factory.createMany('Farm', 2, {
      user_id: user.dataValues.id,
    });
    const id_farms = farms.map(farm => farm.dataValues.id);
    const production = await factory.attrs('LivestockProduction', {
      farms: id_farms,
    });

    const response = await request(app)
      .post('/livestock-production')
      .set('Authorization', `Bearer ${user.generateToken()}`)
      .send(production);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
  });
  it('should not be able to create a livestock production without jwt token', async () => {
    const production = await factory.attrs('LivestockProduction');

    const response = await request(app)
      .post('/livestock-production')
      .send(production);

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({ error: 'Token is not provided' });
  });
  it('should not be able to create a livestock production with invalid jwt token', async () => {
    const production = await factory.attrs('LivestockProduction');

    const response = await request(app)
      .post('/livestock-production')
      .set('Authorization', `Bearer 12348518`)
      .send(production);

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({ error: 'Token invalid' });
  });
  it('should not be able to create a livestock production when required data is missing', async () => {
    const user = await factory.create('User');

    const response = await request(app)
      .post('/livestock-production')
      .set('Authorization', `Bearer ${user.generateToken()}`)
      .send({
        qty_animals: undefined,
        production_year: undefined,
        animals_species: '',
        farms: undefined,
      });

    expect(response.status).toBe(400);
    expect(response.body.messages[0].message).toBe(
      'qty_animals is a required field'
    );
    expect(response.body.messages[1].message).toBe(
      'production_year is a required field'
    );
    expect(response.body.messages[2].message).toBe(
      'animals_species is a required field'
    );
    expect(response.body.messages[3].message).toBe('farms is a required field');
  });
});

describe('Update Livestock Production', () => {
  beforeEach(async () => {
    await truncate();
  });

  it('should be able to update a livestock production', async () => {
    const user = await factory.create('User');
    const farms = await factory.createMany('Farm', 2, {
      user_id: user.dataValues.id,
    });
    const id_farms = farms.map(farm => farm.dataValues.id);
    const production = await factory.create('LivestockProduction', {
      production_year: 2019,
      farms: id_farms,
    });

    const response = await request(app)
      .put(`/livestock-production/${production.dataValues.id}`)
      .set('Authorization', `Bearer ${user.generateToken()}`)
      .send({
        ...production.dataValues,
        production_year: 2020,
      });

    expect(response.status).toBe(200);
    expect(response.body.production_year).toBe(2020);
  });

  it('should not be able to update a livestock production without jwt token', async () => {
    const production = await factory.create('LivestockProduction');

    const response = await request(app)
      .put(`/livestock-production/${production.dataValues.id}`)
      .send({
        ...production.dataValues,
        planting_year: 2020,
      });

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({ error: 'Token is not provided' });
  });

  it('should not be able to update a livestock production with invalid jwt token', async () => {
    const production = await factory.create('LivestockProduction');

    const response = await request(app)
      .put(`/livestock-production/${production.dataValues.id}`)
      .set('Authorization', `Bearer 1561654651`)
      .send({
        ...production.dataValues,
        planting_year: 2020,
      });

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({ error: 'Token invalid' });
  });

  it('should not be able to update a livestock production when required data is missing', async () => {
    const user = await factory.create('User');
    const farms = await factory.createMany('Farm', 5, {
      user_id: user.dataValues.id,
    });
    const id_farms = farms.map(farm => farm.dataValues.id);
    const production = await factory.create('LivestockProduction', {
      planting_year: 2019,
      farms: id_farms,
    });

    const response = await request(app)
      .put(`/livestock-production/${production.dataValues.id}`)
      .set('Authorization', `Bearer ${user.generateToken()}`)
      .send({
        qty_animals: undefined,
        production_year: undefined,
        animals_species: '',
      });

    expect(response.status).toBe(400);
    expect(response.body.messages[0].message).toBe(
      'qty_animals is a required field'
    );
    expect(response.body.messages[1].message).toBe(
      'production_year is a required field'
    );
    expect(response.body.messages[2].message).toBe(
      'animals_species is a required field'
    );
  });

  it('should not be able to update a livestock production when its does not exists', async () => {
    const user = await factory.create('User');
    const farms = await factory.createMany('Farm', 5, {
      user_id: user.dataValues.id,
    });
    const id_farms = farms.map(farm => farm.dataValues.id);
    const production = await factory.create('LivestockProduction', {
      production_year: 2019,
      farms: id_farms,
    });

    const response = await request(app)
      .put(`/livestock-production/${production.dataValues.id + 5000}`)
      .set('Authorization', `Bearer ${user.generateToken()}`)
      .send({
        ...production.dataValues,
        production_year: 2020,
      });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      error: 'Livestock does not exists',
    });
  });

  it('should be able to update farms from livestock production', async () => {
    const user = await factory.create('User');
    const farms = await factory.createMany('Farm', 5, {
      user_id: user.dataValues.id,
    });
    const id_farms = farms.map(farm => farm.dataValues.id);
    const production = await factory.create('LivestockProduction', {
      production_year: 2019,
      farms: id_farms,
    });

    const response = await request(app)
      .put(`/livestock-production/${production.dataValues.id}`)
      .set('Authorization', `Bearer ${user.generateToken()}`)
      .send({
        ...production.dataValues,
        production_year: 2020,
        farms: [farms[0].dataValues.id, farms[1].dataValues.id],
      });

    expect(response.status).toBe(200);
  });
});

describe('Delete Livestock Production', () => {
  beforeEach(async () => {
    await truncate();
  });

  it('should be able to delete a livestock production', async () => {
    const user = await factory.create('User');
    const farms = await factory.createMany('Farm', 5, {
      user_id: user.dataValues.id,
    });
    const id_farms = farms.map(farm => farm.dataValues.id);
    const production = await factory.create('LivestockProduction', {
      farms: id_farms,
    });

    const response = await request(app)
      .delete(`/livestock-production/${production.dataValues.id}`)
      .set('Authorization', `Bearer ${user.generateToken()}`);

    expect(response.status).toBe(200);
  });

  it('should not be able to update a livestock production without jwt token', async () => {
    const production = await factory.create('LivestockProduction');

    const response = await request(app).delete(
      `/livestock-production/${production.dataValues.id}`
    );

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({ error: 'Token is not provided' });
  });

  it('should not be able to delete a livestock production with invalid jwt token', async () => {
    const production = await factory.create('LivestockProduction');

    const response = await request(app)
      .delete(`/livestock-production/${production.dataValues.id}`)
      .set('Authorization', `Bearer 1561654651`);

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({ error: 'Token invalid' });
  });

  it('should not be able to delete a livestock production when its does not exists', async () => {
    const user = await factory.create('User');
    const farms = await factory.createMany('Farm', 5, {
      user_id: user.dataValues.id,
    });
    const id_farms = farms.map(farm => farm.dataValues.id);
    const production = await factory.create('LivestockProduction', {
      farms: id_farms,
    });

    const response = await request(app)
      .delete(`/livestock-production/${production.dataValues.id + 50}`)
      .set('Authorization', `Bearer ${user.generateToken()}`);

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      error: 'Livestock does not exists',
    });
  });
});

describe('List a single livestock Production', () => {
  beforeEach(async () => {
    await truncate();
  });

  it('should be able to list a single livestock production', async () => {
    const user = await factory.create('User');
    const farms = await factory.createMany('Farm', 5, {
      user_id: user.dataValues.id,
    });
    const id_farms = farms.map(farm => farm.dataValues.id);
    const production = await factory.create('LivestockProduction', {
      farms: id_farms,
    });

    const response = await request(app)
      .get(`/livestock-production/${production.dataValues.id}`)
      .set('Authorization', `Bearer ${user.generateToken()}`);

    expect(response.status).toBe(200);
    expect(typeof response.body).toBe('object');
  });

  it('should not be able to list a livestock production without jwt token', async () => {
    const user = await factory.create('User');
    const farms = await factory.createMany('Farm', 5, {
      user_id: user.dataValues.id,
    });
    const id_farms = farms.map(farm => farm.dataValues.id);
    const production = await factory.create('LivestockProduction', {
      farms: id_farms,
    });

    const response = await request(app).get(
      `/livestock-production/${production.dataValues.id}`
    );

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({ error: 'Token is not provided' });
  });

  it('should not be able to list a livestock production with invalid jwt token', async () => {
    const user = await factory.create('User');
    const farms = await factory.createMany('Farm', 5, {
      user_id: user.dataValues.id,
    });
    const id_farms = farms.map(farm => farm.dataValues.id);
    const production = await factory.create('LivestockProduction', {
      farms: id_farms,
    });

    const response = await request(app)
      .get(`/livestock-production/${production.dataValues.id}`)
      .set('Authorization', `Bearer 5556445`);

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({ error: 'Token invalid' });
  });

  it('should be able to list a single livestock production with farms', async () => {
    const user = await factory.create('User');
    const farms = await factory.createMany('Farm', 5, {
      user_id: user.dataValues.id,
    });
    const id_farms = farms.map(farm => farm.dataValues.id);
    const production = await factory.create('LivestockProduction', {
      farms: id_farms,
    });

    const response = await request(app)
      .get(`/livestock-production/${production.dataValues.id}`)
      .set('Authorization', `Bearer ${user.generateToken()}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('farms');
  });
});

describe('List all livestock Productions', () => {
  beforeEach(async () => {
    await truncate();
  });

  it('should be able to list all livestock production', async () => {
    const user = await factory.create('User');
    const farms = await factory.createMany('Farm', 5, {
      user_id: user.dataValues.id,
    });
    const id_farms = farms.map(farm => farm.dataValues.id);
    await factory.createMany('LivestockProduction', 5, {
      farms: id_farms,
    });

    const response = await request(app)
      .get(`/livestock-production`)
      .set('Authorization', `Bearer ${user.generateToken()}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should be able to list all livestock production with parameters', async () => {
    const user = await factory.create('User');
    const farms = await factory.createMany('Farm', 5, {
      user_id: user.dataValues.id,
    });
    const id_farms = farms.map(farm => farm.dataValues.id);
    await factory.createMany('LivestockProduction', 5, {
      farms: id_farms,
      production_year: 2020,
      animals_species: 'boi',
    });

    const response = await request(app)
      .get(`/livestock-production?production_year=2020&animals_species=trigo`)
      .set('Authorization', `Bearer ${user.generateToken()}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should not be able to list all livestock production without jwt token', async () => {
    const user = await factory.create('User');
    const farms = await factory.createMany('Farm', 5, {
      user_id: user.dataValues.id,
    });
    const id_farms = farms.map(farm => farm.dataValues.id);
    await factory.create('LivestockProduction', {
      farms: id_farms,
    });

    const response = await request(app).get(`/livestock-production`);

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({ error: 'Token is not provided' });
  });

  it('should not be able to list a livestock production with invalid jwt token', async () => {
    const user = await factory.create('User');
    const farms = await factory.createMany('Farm', 5, {
      user_id: user.dataValues.id,
    });
    const id_farms = farms.map(farm => farm.dataValues.id);
    await factory.create('LivestockProduction', {
      farms: id_farms,
    });

    const response = await request(app)
      .get(`/livestock-production`)
      .set('Authorization', `Bearer 5556445`);

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({ error: 'Token invalid' });
  });
});
