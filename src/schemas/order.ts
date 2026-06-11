import { z } from 'zod';

export const OrderSchema = z.object({
  id: z.string({ message: 'ORDER_SCHEMA_MARKER id must be string' }),
  total: z.number({ message: 'ORDER_SCHEMA_MARKER total must be number' }),
});
