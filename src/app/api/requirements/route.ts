import { NextRequest, NextResponse } from 'next/server';
import { requireBuyer } from '@/lib/server-auth';
import { serverDb } from '@/lib/server-db';

export async function POST(req: NextRequest) {
  const auth = await requireBuyer(req);
  if (!auth.authorized) {
    return auth.errorResponse!;
  }

  try {
    const body = await req.json();
    const newReq = await serverDb.createRequirement({
      buyer_id: auth.user.id,
      buyer_name: auth.user.company || auth.user.name,
      title: body.title || `${body.required_quantity || 300}t CO2 Requirement`,
      application: body.application || 'Synthetic Fuel',
      required_quantity: Number(body.required_quantity || 300),
      required_purity: Number(body.required_purity || 99.5),
      location: body.location || auth.user.location || 'Pune, MH',
      latitude: Number(body.latitude || 18.5204),
      longitude: Number(body.longitude || 73.8567),
      max_distance: Number(body.max_distance || 300),
      max_price: Number(body.max_price || 4500),
      frequency: body.frequency || 'Monthly Contract',
      status: 'ACTIVE',
    });

    return NextResponse.json({ success: true, requirement: newReq }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: 'SERVER_ERROR', message: err.message }, { status: 500 });
  }
}
