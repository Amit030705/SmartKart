import { z } from 'zod';

export const createOrderSchema = z.object({
  body: z.object({
    shippingAddress: z.object({
      street: z.string().min(1, 'Street is required'),
      city: z.string().min(1, 'City is required'),
      state: z.string().min(1, 'State is required'),
      postalCode: z.string().min(1, 'Postal code is required'),
      country: z.string().default('India'),
      phone: z.string().min(5, 'Valid phone number is required'),
    }),
    paymentMethod: z.enum(['card_simulated', 'cod', 'wallet_simulated']).default('card_simulated'),
    items: z.array(z.object({
      productId: z.string().min(1),
      quantity: z.number().int().positive(),
    })).min(1, 'Order must contain at least one item'),
  }),
});
