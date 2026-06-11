import { z } from 'zod';

export const UserSchema = z.object({
  name: z.string({ message: 'USER_SCHEMA_MARKER name must be string' }),
  age: z.number({ message: 'USER_SCHEMA_MARKER age must be number' }),
});
