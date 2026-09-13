import { NextRequest, NextResponse } from 'next/server';
import { requireBuyer } from '@/lib/server-auth';
import { serverDb } from '@/lib/server-db';

export async function GET(req: NextRequest) {
  const auth = await requireBuyer(req);
  if (!auth.authorized) {
    return auth.errorResponse!;
  }

  try {
    const requirements = await serverDb.getBuyerRequirements(auth.user.id);
    return NextResponse.json(
      {
        success: true,
        requirements,
        data: { requirements },
      },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  } catch (err: any) {
    console.error('[api/requirements] GET error:', err?.message || err);
    return NextResponse.json(
      {
        success: false,
        message: err?.message || 'Failed to fetch requirements',
        requirements: [],
        data: { requirements: [] },
      },
      { status: 500 }
    );
  }
}

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
        { success: false, errorCode: 'INVALID_INPUT', message: 'Invalid JSON request body' },
        { status: 400 }
      );
    }

    const title = String(body.title || '').trim();
    const required_quantity = Number(body.required_quantity);
    const required_purity = Number(body.required_purity);
    const max_price = Number(body.max_price || body.maxPrice || 5000);
    const location = String(body.location || '').trim();
    const application = String(body.application || 'Industrial Off-take').trim();

    if (!title) {
      return NextResponse.json(
        { success: false, errorCode: 'INVALID_INPUT', message: 'Requirement title is required.' },
        { status: 400 }
      );
    }

    if (isNaN(required_quantity) || required_quantity <= 0) {
      return NextResponse.json(
        { success: false, errorCode: 'INVALID_INPUT', message: 'Monthly CO₂ requirement quantity must be greater than zero.' },
        { status: 400 }
      );
    }

    if (isNaN(required_purity) || required_purity <= 0 || required_purity > 100) {
      return NextResponse.json(
        { success: false, errorCode: 'INVALID_INPUT', message: 'Required purity must be between 0% and 100%.' },
        { status: 400 }
      );
    }

    if (isNaN(max_price) || max_price <= 0) {
      return NextResponse.json(
        { success: false, errorCode: 'INVALID_INPUT', message: 'Maximum budget per tonne must be greater than zero.' },
        { status: 400 }
      );
    }

    if (!location) {
      return NextResponse.json(
        { success: false, errorCode: 'INVALID_INPUT', message: 'Delivery location is required.' },
        { status: 400 }
      );
    }

    const newReq = await serverDb.createRequirement({
      buyer_id: auth.user.id,
      buyer_name: auth.user.company || auth.user.name,
      title,
      application: application as any,
      required_quantity,
      required_purity,
      location,
      latitude: Number(body.latitude || 18.5204),
      longitude: Number(body.longitude || 73.8567),
      max_distance: Number(body.max_distance || 300),
      max_price,
      frequency: body.frequency || 'Monthly Contract',
      status: 'ACTIVE',
    });

    return NextResponse.json(
      {
        success: true,
        requirement: newReq,
        data: { requirement: newReq },
        message: 'CO₂ supply requirement created successfully.',
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('[requirements] Error creating requirement:', err?.message || err);
    return NextResponse.json(
      {
        success: false,
        errorCode: 'DATABASE_UNAVAILABLE',
        message: err?.message || 'The database is temporarily unavailable. Please try again.',
      },
      { status: 503 }
    );
  }
}
