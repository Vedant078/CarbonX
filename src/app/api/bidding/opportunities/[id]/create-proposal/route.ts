import { NextRequest, NextResponse } from 'next/server';
import { requireDealer } from '@/lib/server-auth';
import { serverDb } from '@/lib/server-db';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireDealer(req);
  if (!auth.authorized) {
    return auth.errorResponse!;
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const { bid_id } = body;

    if (!bid_id) {
      return NextResponse.json({ error: 'MISSING_FIELDS', message: 'Bid ID is required.' }, { status: 400 });
    }

    const proposal = await serverDb.createProposalFromWinningBid(id, bid_id, auth.user);

    return NextResponse.json({
      success: true,
      proposal,
      message: 'Commercial proposal created from winning bid! Addressed to Buyer for acceptance.',
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: 'SERVER_ERROR', message: err.message }, { status: 500 });
  }
}
