import { NextRequest, NextResponse } from 'next/server';
import { requireDealer } from '@/lib/server-auth';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  const auth = await requireDealer(req);
  if (!auth.authorized) {
    return auth.errorResponse!;
  }

  try {
    const body = await req.json();
    const proposal = await db.createDealerProposal({
      dealer_id: auth.user.id,
      dealer_name: auth.user.company || auth.user.name,
      buyer_id: body.buyer_id || 'user-buyer-demo',
      buyer_name: body.buyer_name || 'GreenFuel Technologies',
      carbon_source_id: body.carbon_source_id || 'src-mumbai-steel',
      carbon_source_name: body.carbon_source_name || 'Mumbai Steel Works',
      quantity: Number(body.quantity || 300),
      price_per_tonne: Number(body.price_per_tonne || 4200),
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
    return NextResponse.json({ error: 'SERVER_ERROR', message: err.message }, { status: 500 });
  }
}
