import { NextRequest, NextResponse } from 'next/server';
import { requireLogisticsProvider } from '@/lib/server-auth';
import { db } from '@/lib/db';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireLogisticsProvider(req);
  if (!auth.authorized) {
    return auth.errorResponse!;
  }

  try {
    const { id } = await params;
    const body = await req.json();

    const updated = await db.updateTransportDetails(id, {
      vehicle_type: body.vehicle_type,
      driver_name: body.driver_name,
      driver_phone: body.driver_phone,
      pickup_date: body.pickup_date,
      estimated_delivery: body.estimated_delivery,
    });

    return NextResponse.json({
      success: true,
      shipment: updated,
      message: 'Transport details updated successfully.',
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'SERVER_ERROR', message: err.message }, { status: 500 });
  }
}
