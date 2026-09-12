import { NextRequest, NextResponse } from 'next/server';
import { requireBuyer } from '@/lib/server-auth';
import { serverDb } from '@/lib/server-db';

export async function POST(req: NextRequest) {
  const auth = await requireBuyer(req);
  if (!auth.authorized) {
    return auth.errorResponse!;
  }

  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'INVALID_INPUT', message: 'Invalid JSON request body' },
        },
        { status: 400 }
      );
    }

    const quantity = Number(body.quantity || 300);
    if (isNaN(quantity) || quantity <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'INVALID_INPUT', message: 'Request quantity must be greater than zero.' },
        },
        { status: 400 }
      );
    }

    const carbonSourceId = body.carbon_source_id || body.listing_id || 'src-mumbai-steel';

    const result = await serverDb.createBuyerRequest({
      buyer_id: auth.user.id,
      buyer_name: auth.user.company || auth.user.name,
      carbon_source_id: carbonSourceId,
      requirement_id: body.requirement_id,
      quantity,
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
    console.error('[supply-requests] Error creating supply request:', err?.message || err);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'DATABASE_UNAVAILABLE',
          message: 'The database is temporarily unavailable. Please try again.',
        },
      },
      { status: 503 }
    );
  }
}
