import { NextRequest, NextResponse } from 'next/server';
import { requireBuyer } from '@/lib/server-auth';
import { serverDb } from '@/lib/server-db';

export async function GET(req: NextRequest) {
  const auth = await requireBuyer(req);
  if (!auth.authorized) {
    return auth.errorResponse!;
  }

  try {
    const bids = await serverDb.getBuyerBids(auth.user.id);
    return NextResponse.json({ success: true, bids });
  } catch (err: any) {
    return NextResponse.json({ error: 'SERVER_ERROR', message: err.message }, { status: 500 });
  }
}
