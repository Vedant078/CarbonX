import { NextRequest, NextResponse } from 'next/server';
import { requireBuyer } from '@/lib/server-auth';
import { serverDb } from '@/lib/server-db';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireBuyer(req);
  if (!auth.authorized) {
    return auth.errorResponse!;
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const { amount_per_tonne, quantity } = body;

    if (!amount_per_tonne || !quantity) {
      return NextResponse.json(
        { error: 'MISSING_FIELDS', message: 'Bid amount per tonne and quantity are required.' },
        { status: 400 }
      );
    }

    const numAmount = Number(amount_per_tonne);
    const numQuantity = Number(quantity);

    if (isNaN(numAmount) || numAmount <= 0 || isNaN(numQuantity) || numQuantity <= 0) {
      return NextResponse.json(
        { error: 'INVALID_INPUT', message: 'Amount and quantity must be positive numbers.' },
        { status: 400 }
      );
    }

    const result = await serverDb.placeBidAtomic(id, auth.user, numAmount, numQuantity);

    return NextResponse.json({
      success: true,
      bid: result.bid,
      opportunity: result.opportunity,
      message: `Your bid of ₹${numAmount.toLocaleString('en-IN')}/tonne was placed successfully! You are currently WINNING.`,
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: 'BID_REJECTED', message: err.message }, { status: 400 });
  }
}
