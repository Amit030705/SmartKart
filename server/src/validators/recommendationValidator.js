import { z } from 'zod';

export const recommendationSchema = z.object({
  body: z.object({
    category: z.enum(['smartphones', 'laptops', 'headphones', 'smartwatches', 'monitors', 'tablets']),
    budgetMin: z.number().min(0).default(0),
    budgetMax: z.number().positive().max(500000).default(500000),
    useCase: z.string().default('Everyday'),
    brands: z.array(z.string()).default([]),
    specs: z.record(z.string(), z.any()).default({}),
    priorities: z.object({
      performance: z.number().min(1).max(5).default(3),
      battery: z.number().min(1).max(5).default(3),
      camera: z.number().min(1).max(5).default(3),
      display: z.number().min(1).max(5).default(3),
      portability: z.number().min(1).max(5).default(3),
      storage: z.number().min(1).max(5).default(3),
      price: z.number().min(1).max(5).default(3),
      reliability: z.number().min(1).max(5).default(3),
    }).default({}),
    limit: z.number().int().positive().max(50).default(10),
  }),
});
