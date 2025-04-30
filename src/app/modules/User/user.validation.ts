import { z } from 'zod';

const strongPasswordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const createUserSchema = z.object({
  userName: z.string(),
  email: z.string().email(),
  // password: z.string().refine((val) => strongPasswordRegex.test(val), {
  //   message:
  //     'Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, a number, and a special character',
  // }),
  dateOfBirth: z.string(),
});

export const userValidation = {
  createUserSchema,
};
