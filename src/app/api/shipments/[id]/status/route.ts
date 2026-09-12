import { NextRequest, NextResponse } from 'next/server';
import { requireLogisticsProvider } from '@/lib/server-auth';
import { db } from '@/lib/db';
import { ShipmentStatus } from '@/types';

const ALLOWED_TRANSITIONS: Record<ShipmentStatus, ShipmentStatus[]> = {
  AWAITING_LOGISTICS: ['PREPARING'],
  PREPARING: ['PICKED_UP'],
  PICKED_UP: ['IN_TRANSIT'],
  IN_TRANSIT: ['DELIVERED'],
  DELIVERED: [], // Terminal state
};

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
    const newStatus: ShipmentStatus = body.status;
    const note: string | undefined = body.note;

    const currentShipment = await db.getShipmentById(id);
    if (!currentShipment) {
      return NextResponse.json({ error: 'NOT_FOUND', message: 'Shipment not found' }, { status: 404 });
    }

    // Validate state transition sequence
    const allowedNext = ALLOWED_TRANSITIONS[currentShipment.status];
    if (allowedNext && !allowedNext.includes(newStatus) && currentShipment.status !== newStatus) {
      return NextResponse.json(
        {
          error: 'INVALID_TRANSITION',
          message: `Cannot transition shipment from ${currentShipment.status} to ${newStatus}. Transition sequence must follow PREPARING -> PICKED_UP -> IN_TRANSIT -> DELIVERED.`,
        },
        { status: 400 }
      );
    }

    const updated = await db.updateShipmentStatus(id, newStatus, note, auth.user.id);

    return NextResponse.json({
      success: true,
      shipment: updated,
      message: `Shipment status updated to ${newStatus}.`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'SERVER_ERROR', message: err.message }, { status: 500 });
  }
}
