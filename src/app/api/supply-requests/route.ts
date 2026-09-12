import { NextRequest, NextResponse } from 'next/server';
import { requireBuyer } from '@/lib/server-auth';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  const auth = await requireBuyer(req);
  if (!auth.authorized) {
    return auth.errorResponse!;
  }

  try {
    const body = await req.json();
    const result = await db.createBuyerRequest({
      buyer_id: auth.user.id,
      buyer_name: auth.user.company || auth.user.name,
      carbon_source_id: body.carbon_source_id || body.listing_id || 'src-mumbai-steel',
      requirement_id: body.requirement_id,
      quantity: Number(body.quantity || 300),
    });

    return NextResponse.json(
      {
        success: true,
        deal: result.deal,
        shipment: result.shipment,
        message: 'Supply request submitted successfully.',
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: 'SERVER_ERROR', message: err.message }, { status: 500 });
  }
}
