import { z } from 'zod';

export const ProductSchema = z.object({
  title: z.string({ message: 'PRODUCT_SCHEMA_MARKER title must be string' }),
  price: z.number({ message: 'PRODUCT_SCHEMA_MARKER price must be number' }),
});
