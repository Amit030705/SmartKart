import { z } from 'zod';

export const createReviewSchema = z.object({
  body: z.object({
    rating: z.number().int().min(1).max(5),
    title: z.string().min(2, 'Title must be at least 2 characters'),
    comment: z.string().min(5, 'Comment must be at least 5 characters'),
  }),
});

export const updateReviewSchema = z.object({
  body: z.object({
    rating: z.number().int().min(1).max(5).optional(),
    title: z.string().min(2).optional(),
    comment: z.string().min(5).optional(),
  }),
});
