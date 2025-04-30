import { UserStatus } from "@prisma/client";

export type IUser = {
  userName: string;
  password: string;
  email: string;
  status: UserStatus;
  dateOfBirth: string;
  currentLocation: string;
  firstName: string;
  lastName: string;
};

export type UpdateUserInput = {
  userName: string;
  password: string;
  dateOfBirth: string;
  currentLocation: string;
};
