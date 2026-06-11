import { z } from 'zod';

export const ShipmentSchema = z.object({
  tracking: z.string({ message: 'SHIPMENT_SCHEMA_MARKER tracking must be string' }),
  carrier: z.string({ message: 'SHIPMENT_SCHEMA_MARKER carrier must be string' }),
});
