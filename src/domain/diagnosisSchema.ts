import { z } from 'zod';
import { IdSchema } from './schema';

export const DiagnosisRecentRaceSchema = z.object({
  finish: z.string(),
  distance: z.string().optional(),
  trackType: z.string().optional(),
  track: z.string().optional(),
  pace: z.string(),
  cornerPassage: z.string(),
  raceClass: z.string().optional(),
});

export const DiagnosisEntrySchema = z.object({
  frame: z.union([z.number(), z.literal('')]),
  number: z.union([z.number(), z.literal('')]),
  horseName: z.string(),
  horseCardId: z.string().nullable().optional(),
  horseInfo: z
    .object({
      sire: z.string().nullable().optional(),
      dam: z.string().nullable().optional(),
      damSire: z.string().nullable().optional(),
      offspringNames: z.array(z.string()).optional(),
    })
    .nullable()
    .optional(),
  recentRaces: z.array(DiagnosisRecentRaceSchema),
});

export const DiagnosisPayloadSchema = z.object({
  raceInfo: z.object({
    date: z.string(),
    course: z.string(),
    raceName: z.string(),
    raceClass: z.string().optional(),
    trackType: z.string(),
    distance: z.string(),
    courseDirection: z.string(),
    trackConfig: z.union([z.string(), z.null()]).optional(),
    trackCondition: z.string(),
  }),
  entries: z.array(DiagnosisEntrySchema),
});

export const DiagnosisResultSchema = z.object({
  rating: z.enum(['S', 'A', 'B', 'C', 'D']),
  number: z.union([z.number(), z.string()]),
  horseName: z.string(),
  reason: z.string(),
});

export const DiagnosisRecordSchema = z.object({
  id: IdSchema,
  raceInfo: z.object({
    date: z.string(),
    course: z.string(),
    raceName: z.string(),
  }),
  payload: DiagnosisPayloadSchema,
  results: z.array(DiagnosisResultSchema),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type DiagnosisRecord = z.infer<typeof DiagnosisRecordSchema>;
