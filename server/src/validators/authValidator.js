import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    avatar: z.string().optional(),
    shippingAddresses: z.array(z.object({
      _id: z.string().optional(),
      street: z.string().min(1),
      city: z.string().min(1),
      state: z.string().min(1),
      postalCode: z.string().min(1),
      country: z.string().default('USA'),
      phone: z.string().min(1),
      isDefault: z.boolean().optional(),
    })).optional(),
    savedPreferences: z.object({
      category: z.string().optional(),
      budgetMin: z.number().optional(),
      budgetMax: z.number().optional(),
      useCase: z.string().optional(),
      brands: z.array(z.string()).optional(),
      priorities: z.record(z.string(), z.number()).optional(),
    }).optional(),
  }),
});
