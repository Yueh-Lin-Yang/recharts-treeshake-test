import { z } from 'zod';

export const AddressSchema = z.object({
  street: z.string({ message: 'ADDRESS_SCHEMA_MARKER street must be string' }),
  city: z.string({ message: 'ADDRESS_SCHEMA_MARKER city must be string' }),
});
