import { z } from 'zod';
import { IdSchema } from './schema';

export const OffspringSchema = z.object({
  id: IdSchema,
  name: z.string().min(1),
});

export type Offspring = z.infer<typeof OffspringSchema>;
