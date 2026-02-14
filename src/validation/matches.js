import { z } from 'zod';

/**
 * Query schema for listing matches with optional limit parameter
 */
export const listMatchesQuerySchema = z.object({
    limit: z.coerce.number().int().positive().max(100).optional(),
});

/**
 * Match status constants
 */
export const MATCH_STATUS = {
    SCHEDULED: 'scheduled',
    LIVE: 'live',
    FINISHED: 'finished',
};

/**
 * Path parameter schema for match ID
 */
export const matchIdParamSchema = z.object({
    id: z.coerce.number().int().positive(),
});

/**
 * Schema for creating a new match
 */
export const createMatchSchema = z
    .object({
        sport: z.string().min(1, 'Sport is required'),
        homeTeam: z.string().min(1, 'Home team is required'),
        awayTeam: z.string().min(1, 'Away team is required'),
        startTime: z.string().refine(
            (val) => {
                try {
                    const date = new Date(val);
                    return !isNaN(date.getTime()) && date.toISOString() === val;
                } catch {
                    return false;
                }
            },
            { message: 'Start time must be a valid ISO date string' }
        ),
        endTime: z.string().refine(
            (val) => {
                try {
                    const date = new Date(val);
                    return !isNaN(date.getTime()) && date.toISOString() === val;
                } catch {
                    return false;
                }
            },
            { message: 'End time must be a valid ISO date string' }
        ),
        homeScore: z.coerce.number().int().nonnegative().optional(),
        awayScore: z.coerce.number().int().nonnegative().optional(),
    })
    .superRefine((data, ctx) => {
        const startDate = new Date(data.startTime);
        const endDate = new Date(data.endTime);

        if (endDate <= startDate) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'End time must be after start time',
                path: ['endTime'],
            });
        }
    });

/**
 * Schema for updating match scores
 */
export const updateScoreSchema = z.object({
    homeScore: z.coerce.number().int().nonnegative(),
    awayScore: z.coerce.number().int().nonnegative(),
});
