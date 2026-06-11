import { z } from 'zod';

export const UserSchema = z.object({
  name: z.string({ message: 'USER_SCHEMA_MARKER name must be string' }),
  age: z.number({ message: 'USER_SCHEMA_MARKER age must be number' }),
});

export const ProductSchema = z.object({
  title: z.string({ message: 'PRODUCT_SCHEMA_MARKER title must be string' }),
  price: z.number({ message: 'PRODUCT_SCHEMA_MARKER price must be number' }),
});

export const OrderSchema = z.object({
  id: z.string({ message: 'ORDER_SCHEMA_MARKER id must be string' }),
  total: z.number({ message: 'ORDER_SCHEMA_MARKER total must be number' }),
});

export const PaymentSchema = z.object({
  method: z.string({ message: 'PAYMENT_SCHEMA_MARKER method must be string' }),
  amount: z.number({ message: 'PAYMENT_SCHEMA_MARKER amount must be number' }),
});

export const AddressSchema = z.object({
  street: z.string({ message: 'ADDRESS_SCHEMA_MARKER street must be string' }),
  city: z.string({ message: 'ADDRESS_SCHEMA_MARKER city must be string' }),
});

export const ShipmentSchema = z.object({
  tracking: z.string({ message: 'SHIPMENT_SCHEMA_MARKER tracking must be string' }),
  carrier: z.string({ message: 'SHIPMENT_SCHEMA_MARKER carrier must be string' }),
});
