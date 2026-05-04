import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { gameSessions, games } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

/**
 * GET /api/games/sessions - Get active game sessions
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const gameId = url.searchParams.get('gameId');
    const status = url.searchParams.get('status') || 'waiting';

    let query = db.query.gameSessions.findMany({
      orderBy: (s) => s.createdAt,
    });

    if (gameId) {
      const sessions = await db.query.gameSessions.findMany({
        where: eq(gameSessions.gameId, gameId),
      });
      return Response.json({ sessions });
    }

    const allSessions = await db.query.gameSessions.findMany();

    return Response.json({ sessions: allSessions });
  } catch (error) {
    console.error('Failed to fetch game sessions:', error);
    return Response.json(
      { error: 'Failed to fetch game sessions' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/games/sessions - Create a new game session
 */
export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { gameId, maxPlayers = 4 } = body;

    if (!gameId) {
      return Response.json(
        { error: 'Missing required field: gameId' },
        { status: 400 }
      );
    }

    // Check if game exists
    const game = await db.query.games.findFirst({
      where: eq(games.id, gameId),
    });

    if (!game) {
      return Response.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }

    // Create session
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await db.insert(gameSessions).values({
      id: sessionId,
      gameId,
      status: 'waiting',
      maxPlayers,
    });

    const newSession = await db.query.gameSessions.findFirst({
      where: eq(gameSessions.id, sessionId),
    });

    return Response.json({ session: newSession }, { status: 201 });
  } catch (error) {
    console.error('Failed to create game session:', error);
    return Response.json(
      { error: 'Failed to create game session' },
      { status: 500 }
    );
  }
}
