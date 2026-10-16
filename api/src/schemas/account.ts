import { z } from 'zod';

/** She types this phrase; the API checks it too, so a stray request can delete nothing. */
export const DELETE_PHRASE = 'delete my account';

export const deleteAccountSchema = z.object({ confirm: z.literal(DELETE_PHRASE) }).strict();
