import { z } from 'zod';

/** A calendar month, 'YYYY-MM'. Nothing about it identifies health data. */
export const historyQuerySchema = z
  .object({
    month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Use a month like 2026-09'),
  })
  .strict();

export type HistoryQuery = z.infer<typeof historyQuerySchema>;
