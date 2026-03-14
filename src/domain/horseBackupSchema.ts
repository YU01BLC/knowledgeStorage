import { z } from 'zod';
import { HorseCardSchema } from './horseSchema';
import { PedigreeSchema } from './pedigreeSchema';
import { OffspringSchema } from './offspringSchema';

export const HorseBackupSchema = z.object({
  version: z.literal(1),
  exportedAt: z.number(),
  horseCards: z.array(HorseCardSchema),
  pedigree: z.array(PedigreeSchema).optional(),
  offspring: z.array(OffspringSchema).optional(),
});

export type HorseBackupData = z.infer<typeof HorseBackupSchema>;
