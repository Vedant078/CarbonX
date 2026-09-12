import { NextRequest, NextResponse } from 'next/server';
import { requireDealer } from '@/lib/server-auth';
import { serverDb } from '@/lib/server-db';

export async function GET() {
  try {
    const opportunities = await serverDb.getBiddingOpportunities();
    return NextResponse.json({ success: true, opportunities });
  } catch (err: any) {
    return NextResponse.json({ error: 'SERVER_ERROR', message: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireDealer(req);
  if (!auth.authorized) {
    return auth.errorResponse!;
  }

  try {
    const body = await req.json();
    const { carbon_source_id, title, description, quantity, starting_price, minimum_bid_increment, duration_hours } = body;

    if (!carbon_source_id || !quantity || !starting_price) {
      return NextResponse.json(
        { error: 'MISSING_FIELDS', message: 'CO2 source, quantity, and starting price are required.' },
        { status: 400 }
      );
    }

    if (quantity <= 0 || starting_price <= 0) {
      return NextResponse.json(
        { error: 'INVALID_INPUT', message: 'Quantity and starting price must be positive numbers.' },
        { status: 400 }
      );
    }

    const opportunity = await serverDb.createBiddingOpportunity({
      carbon_source_id,
      dealer_id: auth.user.id,
      dealer_name: auth.user.company || auth.user.name,
      title,
      description,
      quantity: Number(quantity),
      starting_price: Number(starting_price),
      minimum_bid_increment: minimum_bid_increment ? Number(minimum_bid_increment) : 50,
      duration_hours: duration_hours ? Number(duration_hours) : 48,
    });

    return NextResponse.json({ success: true, opportunity }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: 'SERVER_ERROR', message: err.message }, { status: 500 });
  }
}
