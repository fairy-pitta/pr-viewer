import { NextResponse } from 'next/server';

export const runtime = 'edge';

// This route is deprecated - PRs are now returned directly from the sync endpoint
// Keeping it for backwards compatibility but it returns an empty array
export async function GET() {
  return NextResponse.json([]);
}
