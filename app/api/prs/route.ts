import { NextResponse } from 'next/server';

// This route is deprecated - PRs are now returned directly from the sync endpoint
// Keeping it for backwards compatibility but it returns an empty array
export async function GET() {
  return NextResponse.json([]);
}
