import { Router } from 'express';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';

import validateUserStore from './app/validators/User/UserStore';
import validateUserUpdate from './app/validators/User/UserUpdate';
import validateSessionStore from './app/validators/SessionStore';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();

routes.post('/users', validateUserStore, UserController.store);
routes.post('/sessions', validateSessionStore, SessionController.store);

routes.use(authMiddleware);
routes.put('/users', validateUserUpdate, UserController.update);

export default routes;
