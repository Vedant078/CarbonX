import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/postgres';

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('carbonx_session')?.value;

    if (token) {
      // Invalidate session in PostgreSQL
      await query(`DELETE FROM sessions WHERE token = $1`, [token]);
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
      { error: 'SERVER_ERROR', message: 'Failed to process logout.' },
      { status: 500 }
    );
  }
}
