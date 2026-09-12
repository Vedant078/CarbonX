import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/server-auth';
import { serverDb } from '@/lib/server-db';

export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['BUYER', 'DEALER', 'LOGISTICS']);
    let userId = auth.user?.id;
    let role = auth.user?.role;

    if (!auth.authorized) {
      // Query param fallback for demo / client side state
      const { searchParams } = new URL(req.url);
      userId = searchParams.get('userId') || 'user-dealer-demo';
      role = (searchParams.get('role') as any) || 'DEALER';
    }

    const notifications = await serverDb.getNotifications(userId, role);
    return NextResponse.json({ success: true, notifications });
  } catch (err: any) {
    return NextResponse.json({ error: 'SERVER_ERROR', message: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireRole(req, ['BUYER', 'DEALER', 'LOGISTICS']);
    let userId = auth.user?.id;
    let role = auth.user?.role;

    const body = await req.json().catch(() => ({}));
    const { id, markAllRead } = body;

    if (markAllRead) {
      await serverDb.markAllNotificationsAsRead(userId, role);
      return NextResponse.json({ success: true, message: 'All notifications marked as read' });
    }

    if (id) {
      await serverDb.markNotificationAsRead(id);
      return NextResponse.json({ success: true, message: 'Notification marked as read' });
    }

    return NextResponse.json({ error: 'INVALID_REQUEST', message: 'Provide id or markAllRead: true' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: 'SERVER_ERROR', message: err.message }, { status: 500 });
  }
}
