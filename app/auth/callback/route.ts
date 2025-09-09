// app/auth/callback/route.ts
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  // Supabase JS handles session via URL fragments; simply redirect home (or dashboard).
  const url = new URL(req.url);
  const next = url.searchParams.get('next') || '/';
  return NextResponse.redirect(new URL(next, url.origin));
}
