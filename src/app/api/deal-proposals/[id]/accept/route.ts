import { NextRequest, NextResponse } from 'next/server';
import { requireBuyer } from '@/lib/server-auth';
import { db } from '@/lib/db';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireBuyer(req);
  if (!auth.authorized) {
    return auth.errorResponse!;
  }

  try {
    const { id } = await params;
    const result = await db.acceptProposal(id, auth.user.id);

    return NextResponse.json({
      success: true,
      deal: result.deal,
      shipment: result.shipment,
      message: 'Deal proposal accepted and confirmed. Shipment initialized.',
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'SERVER_ERROR', message: err.message }, { status: 500 });
  }
}
