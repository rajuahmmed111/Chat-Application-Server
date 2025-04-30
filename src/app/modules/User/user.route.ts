import express from 'express';
import UserController from './user.controller';
import { userValidation } from './user.validation';
import { Role } from '@prisma/client';
import validateRequest from '../../middleware/validateRequest';
import auth from '../../middleware/auth';
import { fileUploader } from '../../../helpers/fileUploader';

// import { parseBodyData } from '../../middlewares/parseBodyData';

const router = express.Router();

router.post(
  '/create',
  // validateRequest(userValidation.createUserSchema),
  UserController.createUser
);

// get new members
router.get('/new-members', auth(), UserController.getNewMembers);

router.put(
  '/update',
  auth(),
  // validateRequest(userValidation.createUserSchema),
  UserController.updateUser
);

// update user profile image
router.patch(
  '/profile-update/:id',
  auth(),
  fileUploader.uploadProfileImage,
  UserController.updateUserProfileImage
);

router.get('/', auth(), UserController.getAllUsers);
router.get('/:id', auth(), UserController.getUserById);

// update user first name and last name
router.put(
  '/update',
  auth(),
  // validateRequest(userValidation.createUserSchema),
  UserController.updateUser
);

router.delete('/:id', auth(Role.ADMIN), UserController.deleteUser);

export const userRoute = router;
