import { z } from 'zod';
import { DiagnosisRecordSchema } from './diagnosisSchema';

export const DiagnosisBackupSchema = z.object({
  diagnosisRecords: z.array(DiagnosisRecordSchema),
});

export type DiagnosisBackup = z.infer<typeof DiagnosisBackupSchema>;
