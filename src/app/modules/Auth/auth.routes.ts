import express from 'express';
import { AuthController } from './auth.controller';
import { authValidation } from './auth.validation';
import validateRequest from '../../middleware/validateRequest';
import auth from '../../middleware/auth';

const router = express.Router();

// user login route
router.post('/login', AuthController.loginUser);

router.post('/otp-enter', AuthController.enterOtp);

// user logout route
router.post('/logout', auth(), AuthController.logoutUser);

router.get('/get-me', auth(), AuthController.getMyProfile);

router.put(
  '/change-password',
  validateRequest(authValidation.changePasswordValidationSchema),
  AuthController.changePassword
);

// router.put('/change-password', auth(), AuthController.changePassword);
router.post("/forgot-password", AuthController.forgotPassword);

router.post("/reset-password", AuthController.resetPassword);

export const authRoutes = router;