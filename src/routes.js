import { Router } from 'express';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import FarmController from './app/controllers/FarmController';
import AgricultureProductionController from './app/controllers/AgricultureProductionController';

import validateUserStore from './app/validators/User/UserStore';
import validateUserUpdate from './app/validators/User/UserUpdate';
import validateSessionStore from './app/validators/SessionStore';
import validateFarmStore from './app/validators/Farm/FarmStore';
import validateFarmUpdate from './app/validators/Farm/FarmUpdate';
import validateAgricultureProductionStore from './app/validators/AgricultureProduction/AgricultureProductionStore';
import validateAgricultureProductionUpdate from './app/validators/AgricultureProduction/AgricultureProductionUpdate';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();

routes.post('/users', validateUserStore, UserController.store);
routes.post('/sessions', validateSessionStore, SessionController.store);

routes.use(authMiddleware);
routes.put('/users', validateUserUpdate, UserController.update);

routes.get('/farms', FarmController.index);
routes.get('/farms/:id_farm', FarmController.show);
routes.post('/farms', validateFarmStore, FarmController.store);
routes.put('/farms/:id_farm', validateFarmUpdate, FarmController.update);

routes.get('/agriculture-production', AgricultureProductionController.index);
routes.get(
  '/agriculture-production/:agricultureProduction_id',
  AgricultureProductionController.show
);
routes.post(
  '/agriculture-production',
  validateAgricultureProductionStore,
  AgricultureProductionController.store
);
routes.put(
  '/agriculture-production/:agricultureProduction_id',
  validateAgricultureProductionUpdate,
  AgricultureProductionController.update
);
routes.delete(
  '/agriculture-production/:agricultureProduction_id',
  AgricultureProductionController.delete
);

export default routes;
