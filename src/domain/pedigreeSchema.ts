import { z } from 'zod';
import { IdSchema } from './schema';

export const PedigreeSchema = z.object({
  id: IdSchema,
  name: z.string().min(1),
});

export type Pedigree = z.infer<typeof PedigreeSchema>;
