import { NextRequest, NextResponse } from 'next/server';
import { requireDealer } from '@/lib/server-auth';
import { serverDb } from '@/lib/server-db';

export async function GET() {
  try {
    const opportunities = await serverDb.getBiddingOpportunities();
    return NextResponse.json({ success: true, opportunities });
  } catch (err: any) {
    console.error('[API /api/bidding/opportunities GET Error]:', err?.message || err);
    return NextResponse.json({ success: false, error: 'SERVER_ERROR', message: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const requestId = `req-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  console.log(`[API POST /api/bidding/opportunities ${requestId}] Auction creation request started`);

  try {
    const auth = await requireDealer(req);
    if (!auth.authorized) {
      console.warn(`[API POST /api/bidding/opportunities ${requestId}] Authorization failed`);
      return auth.errorResponse!;
    }

    console.log(`[API POST /api/bidding/opportunities ${requestId}] Authorized Dealer:`, {
      userId: auth.user.id,
      company: auth.user.company || auth.user.name,
      role: auth.user.role,
    });

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { success: false, error: 'INVALID_JSON', message: 'Invalid JSON request body payload.' },
        { status: 400 }
      );
    }

    const carbon_source_id = body.carbon_source_id || body.sourceId;
    const title = body.title;
    const description = body.description;
    const quantity = body.quantity;
    const starting_price = body.starting_price ?? body.startingPrice;
    const minimum_bid_increment = body.minimum_bid_increment ?? body.minBidIncrement;
    const duration_hours = body.duration_hours ?? body.durationHours;

    // Validate required CO2 source
    if (!carbon_source_id || typeof carbon_source_id !== 'string' || !carbon_source_id.trim()) {
      return NextResponse.json(
        { success: false, error: 'MISSING_SOURCE', message: 'Please select a valid industrial CO₂ source.' },
        { status: 400 }
      );
    }

    // Validate title
    const trimmedTitle = typeof title === 'string' ? title.trim() : '';
    if (!trimmedTitle) {
      return NextResponse.json(
        { success: false, error: 'MISSING_TITLE', message: 'Auction title is required.' },
        { status: 400 }
      );
    }

    // Sanitize optional notes / description
    let sanitizedNotes: string | undefined = undefined;
    if (description !== undefined && description !== null) {
      const rawNotes = String(description).trim();
      if (rawNotes && rawNotes.toLowerCase() !== 'nil' && rawNotes.toLowerCase() !== 'n/a' && rawNotes.toLowerCase() !== 'none') {
        sanitizedNotes = rawNotes;
      }
    }

    // Numeric conversions and bounds validations
    const numQty = Number(quantity);
    if (isNaN(numQty) || !isFinite(numQty) || numQty <= 0) {
      return NextResponse.json(
        { success: false, error: 'INVALID_QUANTITY', message: 'Auction quantity must be a positive number greater than zero.' },
        { status: 400 }
      );
    }

    const numPrice = Number(starting_price);
    if (isNaN(numPrice) || !isFinite(numPrice) || numPrice <= 0) {
      return NextResponse.json(
        { success: false, error: 'INVALID_PRICE', message: 'Starting price must be a positive number greater than zero.' },
        { status: 400 }
      );
    }

    const numMinIncrement = minimum_bid_increment !== undefined ? Number(minimum_bid_increment) : 50;
    if (isNaN(numMinIncrement) || !isFinite(numMinIncrement) || numMinIncrement < 50 || !Number.isInteger(numMinIncrement)) {
      return NextResponse.json(
        { success: false, error: 'INVALID_INCREMENT', message: 'Minimum bid increment must be a whole number of at least ₹50.' },
        { status: 400 }
      );
    }

    const numDuration = duration_hours !== undefined ? Number(duration_hours) : 12;
    if (isNaN(numDuration) || !isFinite(numDuration) || numDuration < 12 || !Number.isInteger(numDuration)) {
      return NextResponse.json(
        { success: false, error: 'INVALID_DURATION', message: 'Auction duration must be a whole number of at least 12 hours.' },
        { status: 400 }
      );
    }

    console.log(`[API POST /api/bidding/opportunities ${requestId}] Inputs validated successfully. Creating opportunity in database...`);

    const opportunity = await serverDb.createBiddingOpportunity({
      carbon_source_id: carbon_source_id.trim(),
      dealer_id: auth.user.id,
      dealer_name: auth.user.company || auth.user.name,
      title: trimmedTitle,
      description: sanitizedNotes,
      quantity: numQty,
      starting_price: numPrice,
      minimum_bid_increment: numMinIncrement,
      duration_hours: numDuration,
    });

    console.log(`[API POST /api/bidding/opportunities ${requestId}] Auction created successfully with ID: ${opportunity.id}`);

    return NextResponse.json(
      { 
        success: true, 
        opportunity, 
        message: 'Auction created successfully',
        requestId 
      }, 
      { status: 201 }
    );

  } catch (err: any) {
    console.error(`[API POST /api/bidding/opportunities ${requestId} Exception]:`, err?.stack || err?.message || err);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'SERVER_ERROR', 
        message: err?.message || 'Unable to create auction due to a server or database issue.',
        requestId
      }, 
      { status: 500 }
    );
  }
}
