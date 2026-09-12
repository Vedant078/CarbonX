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

    if (!carbon_source_id || quantity === undefined || starting_price === undefined) {
      return NextResponse.json(
        { error: 'MISSING_FIELDS', message: 'CO2 source, quantity, and starting price are required.' },
        { status: 400 }
      );
    }

    const numQty = Number(quantity);
    const numPrice = Number(starting_price);
    const numMinIncrement = minimum_bid_increment !== undefined ? Number(minimum_bid_increment) : 50;
    const numDuration = duration_hours !== undefined ? Number(duration_hours) : 12;

    if (isNaN(numQty) || numQty <= 0) {
      return NextResponse.json(
        { error: 'INVALID_INPUT', message: 'Quantity must be greater than zero.' },
        { status: 400 }
      );
    }

    if (isNaN(numPrice) || numPrice <= 0) {
      return NextResponse.json(
        { error: 'INVALID_INPUT', message: 'Starting price must be greater than zero.' },
        { status: 400 }
      );
    }

    if (isNaN(numMinIncrement) || numMinIncrement < 50 || !Number.isInteger(numMinIncrement)) {
      return NextResponse.json(
        { error: 'INVALID_INPUT', message: 'Minimum bid increment must be at least ₹50.' },
        { status: 400 }
      );
    }

    if (isNaN(numDuration) || numDuration < 12 || !Number.isInteger(numDuration)) {
      return NextResponse.json(
        { error: 'INVALID_INPUT', message: 'Auction duration must be at least 12 hours.' },
        { status: 400 }
      );
    }

    const opportunity = await serverDb.createBiddingOpportunity({
      carbon_source_id,
      dealer_id: auth.user.id,
      dealer_name: auth.user.company || auth.user.name,
      title: title || 'Spot CO₂ Supply Auction',
      description,
      quantity: numQty,
      starting_price: numPrice,
      minimum_bid_increment: numMinIncrement,
      duration_hours: numDuration,
    });

    return NextResponse.json({ success: true, opportunity }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: 'SERVER_ERROR', message: err.message }, { status: 500 });
  }
}
