import { z } from 'zod';
import { IdSchema } from './schema';

/**
 * =========================
 * HorseCard (馬情報カード)
 * =========================
 */

export const HorseCardSchema = z.object({
  id: IdSchema,
  /** 馬名 */
  name: z.string().min(1),
  /** 父 */
  sire: z.string().optional(),
  /** 母 */
  dam: z.string().optional(),
  /** 母父 */
  damSire: z.string().optional(),
  /** 産駒名の一覧 */
  offspringNames: z.array(z.string().min(1)),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type HorseCard = z.infer<typeof HorseCardSchema>;

/**
 * =========================
 * HorseCard Input (UI → Domain)
 * =========================
 */

export const CreateHorseCardInputSchema = z.object({
  name: z.string().min(1),
  sire: z.string().optional(),
  dam: z.string().optional(),
  damSire: z.string().optional(),
  offspringNames: z.array(z.string().min(1)),
});

export type CreateHorseCardInput = z.infer<typeof CreateHorseCardInputSchema>;

export const UpdateHorseCardInputSchema = CreateHorseCardInputSchema.extend({
  id: IdSchema,
});

export type UpdateHorseCardInput = z.infer<typeof UpdateHorseCardInputSchema>;
