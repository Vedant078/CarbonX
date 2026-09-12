import { NextRequest, NextResponse } from 'next/server';
import { requireDealer } from '@/lib/server-auth';
import { serverDb } from '@/lib/server-db';

export async function POST(req: NextRequest) {
  const auth = await requireDealer(req);
  if (!auth.authorized) {
    return auth.errorResponse!;
  }

  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, errorCode: 'INVALID_INPUT', message: 'Invalid JSON request body' },
        { status: 400 }
      );
    }

    const quantity = Number(body.quantity);
    const price_per_tonne = Number(body.price_per_tonne);

    if (isNaN(quantity) || quantity <= 0 || isNaN(price_per_tonne) || price_per_tonne <= 0) {
      return NextResponse.json(
        {
          success: false,
          errorCode: 'INVALID_INPUT',
          message: 'Proposal volume and price per tonne must be greater than zero.',
        },
        { status: 400 }
      );
    }

    const proposal = await serverDb.createDealerProposal({
      dealer_id: auth.user.id,
      dealer_name: auth.user.company || auth.user.name,
      buyer_id: body.buyer_id || 'user-buyer-demo',
      buyer_name: body.buyer_name || 'GreenFuel Technologies',
      carbon_source_id: body.carbon_source_id || 'src-mumbai-steel',
      carbon_source_name: body.carbon_source_name || 'Mumbai Steel Works',
      quantity,
      price_per_tonne,
    });

    return NextResponse.json(
      {
        success: true,
        proposal,
        message: 'Dealer proposal created successfully.',
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('[deal-proposals] Error creating proposal:', err?.message || err);
    return NextResponse.json(
      {
        success: false,
        errorCode: 'PROPOSAL_CREATION_FAILED',
        message: err?.message || 'Unable to create dealer proposal',
      },
      { status: 500 }
    );
  }
}
