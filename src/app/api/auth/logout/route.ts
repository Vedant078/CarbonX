import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/postgres';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('carbonx_session')?.value;

    if (token) {
      // Invalidate in server-side session cache
      db.deleteSession(token);

      // Invalidate session in PostgreSQL if reachable
      try {
        await query(`DELETE FROM sessions WHERE token = $1`, [token]);
      } catch (dbErr) {
        console.warn('[logout] PostgreSQL session delete warning:', dbErr);
      }
    }

    // Clear HTTP-only cookie
    cookieStore.set('carbonx_session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    return NextResponse.json({ success: true, message: 'Logged out successfully.' });
  } catch (err: any) {
    console.error('Logout API error:', err);
    return NextResponse.json(
      { success: false, error: 'SERVER_ERROR', message: 'Failed to process logout.' },
      { status: 500 }
    );
  }
}
