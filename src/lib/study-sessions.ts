import { desc, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { studySessions } from "@/db/schema";

function getPgErrorCode(error: unknown) {
  if (!error || typeof error !== "object") return undefined;

  if ("code" in error && typeof error.code === "string") return error.code;

  const cause = "cause" in error ? error.cause : undefined;
  if (cause && typeof cause === "object" && "code" in cause && typeof cause.code === "string") {
    return cause.code;
  }

  return undefined;
}

async function getLegacyUserId(authUserId: string) {
  const legacyUserResult = await db.execute<{ user_id: number | string }>(sql`
    select user_id
    from public.users
    where id = ${authUserId}::uuid
    limit 1
  `);

  const legacyUserIdRaw = legacyUserResult[0]?.user_id;
  if (legacyUserIdRaw === undefined || legacyUserIdRaw === null) return undefined;

  const legacyUserId = Number(legacyUserIdRaw);
  if (!Number.isInteger(legacyUserId) || legacyUserId <= 0) return undefined;

  return legacyUserId;
}

function normalizeScore(value: unknown) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.min(100, Math.round(parsed)));
}

export async function saveStudySessionForUser(params: {
  authUserId: string;
  deckId: number;
  scorePercent: number;
}) {
  const { authUserId, deckId, scorePercent } = params;
  const normalizedScore = normalizeScore(scorePercent);

  try {
    await db.insert(studySessions).values({
      userId: authUserId,
      deckId,
      scorePercent: normalizedScore,
    });
    return;
  } catch (error) {
    const pgCode = getPgErrorCode(error);
    if (pgCode !== "22P02") {
      throw error;
    }
  }

  const legacyUserId = await getLegacyUserId(authUserId);
  if (!legacyUserId) {
    throw new Error("Missing legacy user mapping for study session insert.");
  }

  await db.execute(sql`
    insert into public.study_session ("user_id", "deck_id", "score_percent")
    values (${legacyUserId}, ${deckId}, ${normalizedScore})
  `);
}

export async function getLatestDeckScoresForUser(authUserId: string) {
  const result = new Map<number, number>();

  try {
    const rows = await db
      .select({
        deckId: studySessions.deckId,
        scorePercent: studySessions.scorePercent,
      })
      .from(studySessions)
      .where(eq(studySessions.userId, authUserId))
      .orderBy(desc(studySessions.dateCompleted), desc(studySessions.sessionId));

    for (const row of rows) {
      if (!result.has(row.deckId)) {
        result.set(row.deckId, normalizeScore(row.scorePercent));
      }
    }

    return result;
  } catch (error) {
    const pgCode = getPgErrorCode(error);
    if (pgCode !== "22P02") {
      throw error;
    }
  }

  const legacyUserId = await getLegacyUserId(authUserId);
  if (!legacyUserId) return result;

  const rows = await db.execute<{ deck_id: number | string; score_percent: number | string }>(sql`
    select distinct on (deck_id)
      deck_id,
      score_percent
    from public.study_session
    where user_id = ${legacyUserId}
    order by deck_id, date_completed desc, session_id desc
  `);

  for (const row of rows) {
    const deckId = Number(row.deck_id);
    if (!Number.isInteger(deckId) || deckId <= 0) continue;
    result.set(deckId, normalizeScore(row.score_percent));
  }

  return result;
}
