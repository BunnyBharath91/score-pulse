import { z } from 'zod';

/**
 * Query schema for listing commentary with optional limit parameter
 */
export const listCommentaryQuerySchema = z.object({
    limit: z.coerce.number().int().positive().max(100).optional(),
});

/**
 * Schema for creating a new commentary
 */
export const createCommentarySchema = z.object({
    minute: z.number().int().nonnegative(),
    sequence: z.number().int().optional(),
    period: z.string().optional(),
    eventType: z.string().optional(),
    actor: z.string().optional(),
    team: z.string().optional(),
    message: z.string().min(1, 'Message is required'),
    metadata: z.record(z.string(), z.any()).optional(),
    tags: z.array(z.string()).optional(),
});
