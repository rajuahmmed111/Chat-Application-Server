import express from 'express';
import { authRoutes } from '../modules/Auth/auth.routes';
import { userRoute } from '../modules/User/user.route';
import { replayRoute } from '../modules/Replay/replay.route';

const router = express.Router();

const moduleRoutes = [
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/auth',
    route: authRoutes,
  },
  
  {
    path: '/replay',
    route: replayRoute,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
