import { NextRequest, NextResponse } from 'next/server';
import { serverDb } from '@/lib/server-db';
import { requireDealer } from '@/lib/server-auth';

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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireDealer(req);
  if (!auth.authorized) {
    return auth.errorResponse!;
  }

  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));

    const updatedOpp = await serverDb.updateBiddingOpportunity(id, auth.user.id, body);

    return NextResponse.json({
      success: true,
      opportunity: updatedOpp,
      message: 'Auction updated successfully.',
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'UPDATE_FAILED', message: err.message }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireDealer(req);
  if (!auth.authorized) {
    return auth.errorResponse!;
  }

  try {
    const { id } = await params;
    const cancelledOpp = await serverDb.cancelBiddingOpportunity(id, auth.user.id);

    return NextResponse.json({
      success: true,
      opportunity: cancelledOpp,
      message: 'Auction cancelled successfully.',
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'CANCEL_FAILED', message: err.message }, { status: 400 });
  }
}

