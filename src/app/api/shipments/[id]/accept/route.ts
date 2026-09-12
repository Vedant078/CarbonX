import { NextRequest, NextResponse } from 'next/server';
import { requireLogisticsProvider } from '@/lib/server-auth';
import { serverDb } from '@/lib/server-db';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireLogisticsProvider(req);
  if (!auth.authorized) {
    return auth.errorResponse!;
  }

  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const shipment = await serverDb.acceptShipment(
      id,
      auth.user.id,
      auth.user.company || auth.user.name,
      body.vehicle_type || '28-Tonne Cryogenic Semi-Trailer',
      body.driver_name || 'Driver Rajesh Kumar'
    );

    return NextResponse.json({
      success: true,
      shipment,
      message: 'Shipment accepted by Logistics Provider.',
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'SERVER_ERROR', message: err.message }, { status: 500 });
  }
}
