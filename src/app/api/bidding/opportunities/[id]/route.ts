import { NextRequest, NextResponse } from 'next/server';
import { serverDb } from '@/lib/server-db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const opportunity = await serverDb.getBiddingOpportunityById(id);

    if (!opportunity) {
      return NextResponse.json({ error: 'NOT_FOUND', message: 'Bidding opportunity not found.' }, { status: 404 });
    }

    const bids = await serverDb.getBidsForOpportunity(id);

    return NextResponse.json({
      success: true,
      opportunity,
      bids,
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'SERVER_ERROR', message: err.message }, { status: 500 });
  }
}
