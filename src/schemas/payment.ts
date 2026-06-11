import { z } from 'zod';

export const PaymentSchema = z.object({
  method: z.string({ message: 'PAYMENT_SCHEMA_MARKER method must be string' }),
  amount: z.number({ message: 'PAYMENT_SCHEMA_MARKER amount must be number' }),
});
