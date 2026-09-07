import { z } from 'zod';

export const userSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  email: z.string().email().optional(),
  image: z.string().optional(),
  password: z.string().min(6).optional(),
  passwordHash: z.string().optional(),
  role: z.enum(['student', 'mentor', 'admin']).default('student'),
  status: z.enum(['active', 'suspended', 'pending_verification']).default('active'),
});

export type UserInput = z.infer<typeof userSchema>;
