import { z } from 'zod';

/**
 * =========================
 * Common
 * =========================
 */
export const IdSchema = z.string().uuid();

/**
 * =========================
 * Label
 * =========================
 */
export const LabelSchema = z.object({
  id: IdSchema,
  name: z.string().min(1),
});

export type Label = z.infer<typeof LabelSchema>;

/**
 * =========================
 * Card
 * =========================
 */
export const CardSchema = z.object({
  id: IdSchema,
  title: z.string().min(1),
  body: z.string(),

  labelIds: z.array(IdSchema),

  createdAt: z.number(),
  updatedAt: z.number(),
});

export type Card = z.infer<typeof CardSchema>;
