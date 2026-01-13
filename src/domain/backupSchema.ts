import { z } from 'zod';
import { CardSchema, LabelSchema } from './schema';

export const BackupSchema = z.object({
  version: z.literal(1),
  exportedAt: z.number(),
  cards: z.array(CardSchema),
  labels: z.array(LabelSchema),
});

export type BackupData = z.infer<typeof BackupSchema>;
