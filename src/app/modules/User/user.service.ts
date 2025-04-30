import * as bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiErrors';
import prisma from '../../../shared/prisma';
import { IUser, UpdateUserInput } from './user.interface';
import config from '../../../config';
import { UserStatus } from '@prisma/client';
import { ObjectId } from 'mongodb';


// create user
const createUser = async (payload: any) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (existingUser) {
    if (existingUser.UserStatus === UserStatus.INACTIVE) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'This user is inactive and cannot be created.'
      );
    }
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'This user information already exists'
    );
  }

  const existingUserName = await prisma.user.findUnique({
    where: { userName: payload.userName },
  });

  if (existingUserName) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Username already exists!');
  }

  const hashedPassword = await bcrypt.hash(payload.password, config.salt || 12);

  const user = await prisma.user.create({
    data: {
      ...payload,
      password: hashedPassword,
    },
  });

  const { password, otp, otpExpiry, hexCode, ...updateUser } = user;

  return updateUser;
};


// check user  name
const checkUsernameExists = async (userName: string) => {
  const existingUser = await prisma.user.findUnique({
    where: { userName },
  });

  return !!existingUser;
};

export { checkUsernameExists };

const getAllUsers = async () => {
  const users = await prisma.user.findMany();
  if (users.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No users found');
  }
  return users;
};
// TODO: check this function
const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  return user;
};


// delete a user
const deleteUser = async (userId: string, loggedId: string) => {
  if (!ObjectId.isValid(userId)) {
    throw new ApiError(400, 'Invalid user ID format');
  }

  if (userId === loggedId) {
    throw new ApiError(403, "You can't delete your own account!");
  }

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!existingUser) {
    throw new ApiError(404, 'User not found');
  }

  // Delete the user
  await prisma.user.delete({
    where: { id: userId },
  });

  return;
};

const getNewMembers = async () => {
  const users = await prisma.user.findMany({
    where: {
      UserStatus: UserStatus.ACTIVE,
    },
    select: {
      id: true,
      userName: true,
      email: true,
      profileImage: true,
      firstName: true,
      lastName: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  return users;
};

// update user first name and last name
const updateUser = async (email: string, updates: UpdateUserInput) => {
  // console.log(email);

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  if ('password' in updates) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'updates are not allowed');
  }

  const { firstName, lastName } = updates;

  const updatedUser = await prisma.user.update({
    where: { email },
    data: {
      firstName: firstName || user.firstName,
      lastName: lastName || user.lastName,
    },
    select: {
      id: true,
      email: true,
      UserStatus: true,
      profileImage: true,
      createdAt: true,
      updatedAt: true,
      firstName: true,
      lastName: true,
    },
  });

  return updatedUser;
};

// update user profile image
const updateUserProfileImage = async (
  userId: string,
  profileImageUrl: string
) => {
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!existingUser) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Update user's profile image
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { profileImage: profileImageUrl },
  });

  const { id, email, profileImage } = updatedUser;

  return { id, email, profileImage };
};

export const UserService = {
  createUser,
  getAllUsers,
  getUserById,
  deleteUser,
  checkUsernameExists,
  getNewMembers,
  updateUser,
  updateUserProfileImage,
};
