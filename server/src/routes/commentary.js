import { Router } from 'express';
import { desc, eq } from 'drizzle-orm';
import { db } from '../db/db.js';
import { commentary } from '../db/schema.js';
import { createCommentarySchema, listCommentaryQuerySchema } from '../validation/commentary.js';
import { matchIdParamSchema } from '../validation/matches.js';

export const commentaryRouter = Router();

const MAX_LIMIT = 100;

commentaryRouter.get("/", async (req, res) => {
    const paramsResult = matchIdParamSchema.safeParse({ id: req.matchId });
    if (!paramsResult.success) {
        return res.status(400).json({
            error: "Invalid path parameters.",
            details: paramsResult.error.flatten(),
        });
    }

    const queryResult = listCommentaryQuerySchema.safeParse(req.query);
    if (!queryResult.success) {
        return res.status(400).json({
            error: "Invalid query parameters.",
            details: queryResult.error.flatten(),
        });
    }

    const { id: matchId } = paramsResult.data;
    const limit = Math.min(queryResult.data.limit ?? 100, MAX_LIMIT);

    try {
        const data = await db
            .select()
            .from(commentary)
            .where(eq(commentary.matchId, matchId))
            .orderBy(desc(commentary.createdAt))
            .limit(limit);

        return res.status(200).json({ data });
    } catch (error) {
        return res.status(500).json({
            error: "Failed to fetch commentary.",
            details: error.message,
        });
    }
});

commentaryRouter.post("/", async (req, res) => {
    const paramsResult = matchIdParamSchema.safeParse({ id: req.matchId });
    if (!paramsResult.success) {
        return res.status(400).json({
            error: "Invalid path parameters.",
            details: paramsResult.error.flatten(),
        });
    }

    const bodyResult = createCommentarySchema.safeParse(req.body);
    if (!bodyResult.success) {
        return res.status(400).json({
            error: "Invalid payload.",
            details: bodyResult.error.flatten(),
        });
    }

    const { id: matchId } = paramsResult.data;
    const payload = bodyResult.data;

    try {
        const [result] = await db
            .insert(commentary)
            .values({
                matchId,
                minute: payload.minute,
                sequence: payload.sequence,
                period: payload.period,
                eventType: payload.eventType,
                actor: payload.actor,
                team: payload.team,
                message: payload.message,
                metadata: payload.metadata,
                tags: payload.tags,
            })
            .returning();

        if (res.app.locals.broadcastCommentary) {
            try {
                res.app.locals.broadcastCommentary(result.matchId, result);
            } catch (error) {
                console.error("Failed to broadcast commentary", error);
            }
        }

        return res.status(201).json({ data: result });
    } catch (error) {
        return res.status(500).json({
            error: "Failed to create commentary.",
            details: error.message,
        });
    }
});