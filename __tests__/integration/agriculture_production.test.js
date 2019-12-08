import request from 'supertest';
import app from '../../src/app';

import factory from '../factories';
import truncate from '../util/truncate';

describe('Create Agriculte Production', () => {
  beforeEach(async () => {
    await truncate();
  });

  it('should be able to create a new agriculture production', async () => {
    const user = await factory.create('User');
    const farms = await factory.createMany('Farm', 5, {
      user_id: user.dataValues.id,
      qty_hectares_land: 10,
    });
    const id_farms = farms.map(farm => farm.dataValues.id);

    const production = await factory.attrs('AgricultureProduction', {
      farms: id_farms,
      qty_hectares_planted: 20,
    });

    const response = await request(app)
      .post('/agriculture-production')
      .set('Authorization', `Bearer ${user.generateToken()}`)
      .send(production);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
  });
  it('should not be able to create a agriculture production without jwt token', async () => {
    const production = await factory.attrs('AgricultureProduction');

    const response = await request(app)
      .post('/agriculture-production')
      .send(production);

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({ error: 'Token is not provided' });
  });

  it('should not be able to create a agriculture production with invalid jwt token', async () => {
    const production = await factory.attrs('AgricultureProduction');

    const response = await request(app)
      .post('/agriculture-production')
      .set('Authorization', `Bearer 12348518`)
      .send(production);

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({ error: 'Token invalid' });
  });

  it('should not be able to create a agriculture production when required data is missing', async () => {
    const user = await factory.create('User');

    const response = await request(app)
      .post('/agriculture-production')
      .set('Authorization', `Bearer ${user.generateToken()}`)
      .send({
        qty_hectares_planted: undefined,
        planting_year: undefined,
        planting_crop: '',
        farms: undefined,
      });

    expect(response.status).toBe(400);
    expect(response.body.messages[0].message).toBe(
      'qty_hectares_planted is a required field'
    );
    expect(response.body.messages[1].message).toBe(
      'planting_year is a required field'
    );
    expect(response.body.messages[2].message).toBe(
      'planting_crop is a required field'
    );
    expect(response.body.messages[3].message).toBe('farms is a required field');
  });

  it('should not be able to create a new agriculture production when qty_hectares_planted is higher than sum of qty_hectares_land farm', async () => {
    const user = await factory.create('User');
    const farms = await factory.createMany('Farm', 5, {
      user_id: user.dataValues.id,
      qty_hectares_land: 10,
    });
    const id_farms = farms.map(farm => farm.dataValues.id);

    const production = await factory.attrs('AgricultureProduction', {
      farms: id_farms,
      qty_hectares_planted: 60,
    });

    const response = await request(app)
      .post('/agriculture-production')
      .set('Authorization', `Bearer ${user.generateToken()}`)
      .send(production);

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      error: 'Hectares planted is higher than sum of hectares land from farms ',
    });
  });
});

describe('Update Agriculte Production', () => {
  beforeEach(async () => {
    await truncate();
  });

  it('should be able to update a agriculture production', async () => {
    const user = await factory.create('User');
    const farms = await factory.createMany('Farm', 5, {
      user_id: user.dataValues.id,
    });
    const id_farms = farms.map(farm => farm.dataValues.id);
    const production = await factory.create('AgricultureProduction', {
      planting_year: 2019,
      farms: id_farms,
    });

    const response = await request(app)
      .put(`/agriculture-production/${production.dataValues.id}`)
      .set('Authorization', `Bearer ${user.generateToken()}`)
      .send({
        qty_hectares_planted: production.dataValues.qty_hectares_planted,
        planting_crop: production.dataValues.planting_crop,
        planting_year: 2020,
      });

    expect(response.status).toBe(200);
    expect(response.body.planting_year).toBe(2020);
  });

  it('should not be able to update a agriculture production without jwt token', async () => {
    const production = await factory.create('AgricultureProduction');

    const response = await request(app)
      .put(`/agriculture-production/${production.dataValues.id}`)
      .send({
        qty_hectares_planted: production.dataValues.qty_hectares_planted,
        planting_crop: production.dataValues.planting_crop,
        planting_year: 2020,
      });

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({ error: 'Token is not provided' });
  });

  it('should not be able to update a agriculture production with invalid jwt token', async () => {
    const production = await factory.create('AgricultureProduction');

    const response = await request(app)
      .put(`/agriculture-production/${production.dataValues.id}`)
      .set('Authorization', `Bearer 1561654651`)
      .send({
        qty_hectares_planted: production.dataValues.qty_hectares_planted,
        planting_crop: production.dataValues.planting_crop,
        planting_year: 2020,
      });

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({ error: 'Token invalid' });
  });

  it('should not be able to update a agriculture production when required data is missing', async () => {
    const user = await factory.create('User');
    const farms = await factory.createMany('Farm', 5, {
      user_id: user.dataValues.id,
    });
    const id_farms = farms.map(farm => farm.dataValues.id);
    const production = await factory.create('AgricultureProduction', {
      planting_year: 2019,
      farms: id_farms,
    });

    const response = await request(app)
      .put(`/agriculture-production/${production.dataValues.id}`)
      .set('Authorization', `Bearer ${user.generateToken()}`)
      .send({
        qty_hectares_planted: undefined,
        planting_year: undefined,
        planting_crop: '',
      });

    expect(response.status).toBe(400);
    expect(response.body.messages[0].message).toBe(
      'qty_hectares_planted is a required field'
    );
    expect(response.body.messages[1].message).toBe(
      'planting_year is a required field'
    );
    expect(response.body.messages[2].message).toBe(
      'planting_crop is a required field'
    );
  });

  it('should not be able to update a agriculture production when its does not exists', async () => {
    const user = await factory.create('User');
    const farms = await factory.createMany('Farm', 5, {
      user_id: user.dataValues.id,
    });
    const id_farms = farms.map(farm => farm.dataValues.id);
    const production = await factory.create('AgricultureProduction', {
      planting_year: 2019,
      farms: id_farms,
    });

    const response = await request(app)
      .put(`/agriculture-production/${production.dataValues.id + 50}`)
      .set('Authorization', `Bearer ${user.generateToken()}`)
      .send({
        qty_hectares_planted: production.dataValues.qty_hectares_planted,
        planting_crop: production.dataValues.planting_crop,
        planting_year: 2020,
      });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      error: 'Production does not exists',
    });
  });

  it('should be able to update farms from agriculture production', async () => {
    const user = await factory.create('User');
    const farms = await factory.createMany('Farm', 5, {
      user_id: user.dataValues.id,
    });
    const id_farms = farms.map(farm => farm.dataValues.id);
    const production = await factory.create('AgricultureProduction', {
      planting_year: 2019,
      farms: id_farms,
    });

    const response = await request(app)
      .put(`/agriculture-production/${production.dataValues.id}`)
      .set('Authorization', `Bearer ${user.generateToken()}`)
      .send({
        qty_hectares_planted: production.dataValues.qty_hectares_planted,
        planting_crop: production.dataValues.planting_crop,
        planting_year: 2020,
        farms: [farms[0].dataValues.id, farms[1].dataValues.id],
      });

    expect(response.status).toBe(200);
  });

  it('should not be able to update a new agriculture production when qty_hectares_planted is higher than sum of qty_hectares_land farm', async () => {
    const user = await factory.create('User');
    const farms = await factory.createMany('Farm', 5, {
      user_id: user.dataValues.id,
      qty_hectares_land: 10,
    });
    const id_farms = farms.map(farm => farm.dataValues.id);

    const production = await factory.create('AgricultureProduction', {
      farms: id_farms,
      qty_hectares_planted: 60,
    });
    const farm = await factory.create('Farm', {
      qty_hectares_land: 10,
    });

    const response = await request(app)
      .put(`/agriculture-production/${production.dataValues.id}`)
      .set('Authorization', `Bearer ${user.generateToken()}`)
      .send({
        qty_hectares_planted: production.dataValues.qty_hectares_planted,
        planting_crop: production.dataValues.planting_crop,
        planting_year: production.dataValues.planting_year,
        farms: [farm.dataValues.id],
      });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      error: 'Hectares planted is higher than sum of hectares land from farms ',
    });
  });
});

describe('Delete Agriculte Production', () => {
  beforeEach(async () => {
    await truncate();
  });

  it('should be able to delete a agriculture production', async () => {
    const user = await factory.create('User');
    const farms = await factory.createMany('Farm', 5, {
      user_id: user.dataValues.id,
    });
    const id_farms = farms.map(farm => farm.dataValues.id);
    const production = await factory.create('AgricultureProduction', {
      farms: id_farms,
    });

    const response = await request(app)
      .delete(`/agriculture-production/${production.dataValues.id}`)
      .set('Authorization', `Bearer ${user.generateToken()}`);

    expect(response.status).toBe(200);
  });

  it('should not be able to update a agriculture production without jwt token', async () => {
    const production = await factory.create('AgricultureProduction');

    const response = await request(app).delete(
      `/agriculture-production/${production.dataValues.id}`
    );

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({ error: 'Token is not provided' });
  });

  it('should not be able to delete a agriculture production with invalid jwt token', async () => {
    const production = await factory.create('AgricultureProduction');

    const response = await request(app)
      .delete(`/agriculture-production/${production.dataValues.id}`)
      .set('Authorization', `Bearer 1561654651`);

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({ error: 'Token invalid' });
  });

  it('should not be able to delete a agriculture production when its does not exists', async () => {
    const user = await factory.create('User');
    const farms = await factory.createMany('Farm', 5, {
      user_id: user.dataValues.id,
    });
    const id_farms = farms.map(farm => farm.dataValues.id);
    const production = await factory.create('AgricultureProduction', {
      farms: id_farms,
    });

    const response = await request(app)
      .delete(`/agriculture-production/${production.dataValues.id + 50}`)
      .set('Authorization', `Bearer ${user.generateToken()}`);

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      error: 'Production does not exists',
    });
  });
});

describe('List a single agriculture Production', () => {
  beforeEach(async () => {
    await truncate();
  });

  it('should be able to list a single agriculture production', async () => {
    const user = await factory.create('User');
    const farms = await factory.createMany('Farm', 5, {
      user_id: user.dataValues.id,
    });
    const id_farms = farms.map(farm => farm.dataValues.id);
    const production = await factory.create('AgricultureProduction', {
      farms: id_farms,
    });

    const response = await request(app)
      .get(`/agriculture-production/${production.dataValues.id}`)
      .set('Authorization', `Bearer ${user.generateToken()}`);

    expect(response.status).toBe(200);
    expect(typeof response.body).toBe('object');
  });

  it('should not be able to list a agriculture production without jwt token', async () => {
    const user = await factory.create('User');
    const farms = await factory.createMany('Farm', 5, {
      user_id: user.dataValues.id,
    });
    const id_farms = farms.map(farm => farm.dataValues.id);
    const production = await factory.create('AgricultureProduction', {
      farms: id_farms,
    });

    const response = await request(app).get(
      `/agriculture-production/${production.dataValues.id}`
    );

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({ error: 'Token is not provided' });
  });

  it('should not be able to list a agriculture production with invalid jwt token', async () => {
    const user = await factory.create('User');
    const farms = await factory.createMany('Farm', 5, {
      user_id: user.dataValues.id,
    });
    const id_farms = farms.map(farm => farm.dataValues.id);
    const production = await factory.create('AgricultureProduction', {
      farms: id_farms,
    });

    const response = await request(app)
      .get(`/agriculture-production/${production.dataValues.id}`)
      .set('Authorization', `Bearer 5556445`);

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({ error: 'Token invalid' });
  });

  it('should be able to list a single agriculture production with farms', async () => {
    const user = await factory.create('User');
    const farms = await factory.createMany('Farm', 5, {
      user_id: user.dataValues.id,
    });
    const id_farms = farms.map(farm => farm.dataValues.id);
    const production = await factory.create('AgricultureProduction', {
      farms: id_farms,
    });

    const response = await request(app)
      .get(`/agriculture-production/${production.dataValues.id}`)
      .set('Authorization', `Bearer ${user.generateToken()}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('farms');
  });
});

describe('List all agriculture Productions', () => {
  beforeEach(async () => {
    await truncate();
  });

  it('should be able to list all agriculture production', async () => {
    const user = await factory.create('User');
    const farms = await factory.createMany('Farm', 5, {
      user_id: user.dataValues.id,
    });
    const id_farms = farms.map(farm => farm.dataValues.id);
    await factory.createMany('AgricultureProduction', 5, {
      farms: id_farms,
    });

    const response = await request(app)
      .get(`/agriculture-production`)
      .set('Authorization', `Bearer ${user.generateToken()}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('should not be able to list all agriculture production without jwt token', async () => {
    const user = await factory.create('User');
    const farms = await factory.createMany('Farm', 5, {
      user_id: user.dataValues.id,
    });
    const id_farms = farms.map(farm => farm.dataValues.id);
    await factory.create('AgricultureProduction', {
      farms: id_farms,
    });

    const response = await request(app).get(`/agriculture-production`);

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({ error: 'Token is not provided' });
  });

  it('should not be able to list a agriculture production with invalid jwt token', async () => {
    const user = await factory.create('User');
    const farms = await factory.createMany('Farm', 5, {
      user_id: user.dataValues.id,
    });
    const id_farms = farms.map(farm => farm.dataValues.id);
    await factory.create('AgricultureProduction', {
      farms: id_farms,
    });

    const response = await request(app)
      .get(`/agriculture-production`)
      .set('Authorization', `Bearer 5556445`);

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({ error: 'Token invalid' });
  });
});
