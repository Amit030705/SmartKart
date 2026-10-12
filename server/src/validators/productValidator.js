import { z } from 'zod';

export const productCreateSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Product name is required'),
    brand: z.string().min(1, 'Brand is required'),
    category: z.enum(['smartphones', 'laptops', 'headphones', 'smartwatches', 'monitors', 'tablets']),
    subcategory: z.string().optional(),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    price: z.number().positive('Price must be greater than 0'),
    originalPrice: z.number().positive().optional(),
    model: z.string().optional(),
    configuration: z.string().optional(),
    mrp: z.number().positive().optional(),
    images: z.array(z.string().url('Image must be a valid URL')).min(1, 'At least one image is required'),
    stock: z.number().int().min(0, 'Stock cannot be negative'),
    warranty: z.string().optional(),
    seller: z.object({
      name: z.string().optional(),
      rating: z.number().optional(),
      isAuthorized: z.boolean().optional(),
    }).optional(),
    specs: z.record(z.string(), z.any()).optional(),
    isFeatured: z.boolean().optional(),
    isTrending: z.boolean().optional(),
  }),
});

export const productUpdateSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    brand: z.string().min(1).optional(),
    category: z.enum(['smartphones', 'laptops', 'headphones', 'smartwatches', 'monitors', 'tablets']).optional(),
    subcategory: z.string().optional(),
    description: z.string().min(10).optional(),
    price: z.number().positive().optional(),
    originalPrice: z.number().positive().optional(),
    model: z.string().optional(),
    configuration: z.string().optional(),
    mrp: z.number().positive().optional(),
    images: z.array(z.string()).min(1).optional(),
    stock: z.number().int().min(0).optional(),
    warranty: z.string().optional(),
    seller: z.object({
      name: z.string().optional(),
      rating: z.number().optional(),
      isAuthorized: z.boolean().optional(),
    }).optional(),
    specs: z.record(z.string(), z.any()).optional(),
    isFeatured: z.boolean().optional(),
    isTrending: z.boolean().optional(),
  }),
});
