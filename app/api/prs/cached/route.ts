import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

// This route reads from Cloudflare KV cache for faster PR loading
// Falls back to live sync if cache miss

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // Try to get from KV cache (only works in Cloudflare environment)
    const env = (request as any).env;

    if (env?.PR_CACHE) {
      const cached = await env.PR_CACHE.get(`prs:${userId}`);

      if (cached) {
        const data = JSON.parse(cached);
        return NextResponse.json({
          success: true,
          cached: true,
          syncedAt: data.syncedAt,
          prs: data.prs,
        });
      }
    }

    // Cache miss - return empty with flag to trigger live sync
    return NextResponse.json({
      success: true,
      cached: false,
      prs: [],
      message: 'Cache miss - trigger live sync',
    });
  } catch (error) {
    console.error('Error reading from cache:', error);
    return NextResponse.json(
      { error: 'Failed to read from cache', cached: false },
      { status: 500 }
    );
  }
}

// Register user for periodic sync
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const env = (request as any).env;

    if (env?.PR_CACHE) {
      // Get current users list
      const usersJson = await env.PR_CACHE.get('sync_users');
      const users: string[] = usersJson ? JSON.parse(usersJson) : [];

      // Add user if not already in list
      if (!users.includes(userId)) {
        users.push(userId);
        await env.PR_CACHE.put('sync_users', JSON.stringify(users));
      }

      return NextResponse.json({
        success: true,
        message: `User ${userId} registered for periodic sync`,
      });
    }

    return NextResponse.json({
      success: false,
      message: 'KV not available - running in development mode',
    });
  } catch (error) {
    console.error('Error registering user:', error);
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    );
  }
}
