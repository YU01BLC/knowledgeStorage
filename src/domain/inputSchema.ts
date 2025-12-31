import { z } from 'zod';
import { IdSchema } from './schema';

/**
 * =========================
 * Card Input (UI → Domain)
 * =========================
 */
export const CreateCardInputSchema = z.object({
  title: z.string().min(1),
  body: z.string(),
  labelIds: z.array(IdSchema),
});

export type CreateCardInput = z.infer<typeof CreateCardInputSchema>;

export const UpdateCardInputSchema = CreateCardInputSchema.extend({
  id: IdSchema,
});

export type UpdateCardInput = z.infer<typeof UpdateCardInputSchema>;
