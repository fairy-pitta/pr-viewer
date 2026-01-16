import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

import { GitHubAPIClient } from '@infrastructure/external/github/GitHubAPIClient';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // GitHub APIでトークンを検証
    const githubClient = new GitHubAPIClient(token);
    
    try {
      const user = await githubClient.getUser();
      return NextResponse.json({
        success: true,
        user: {
          id: user.id.toString(),
          login: user.login,
          avatarUrl: user.avatar_url,
        },
      });
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid token or insufficient permissions' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Error validating token:', error);
    return NextResponse.json(
      { error: 'Failed to validate token' },
      { status: 500 }
    );
  }
}
