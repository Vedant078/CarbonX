import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { queryOne } from '@/lib/postgres';
import { UserProfile, UserRole } from '@/types';
import { INITIAL_USERS } from '@/lib/seed-data';

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('carbonx_session')?.value;

    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // Demo token fallback resolution
    if (token.startsWith('demo-token-')) {
      const matched = INITIAL_USERS.find((u) => token.includes(u.id)) || INITIAL_USERS[0];
      return NextResponse.json({ user: matched });
    }

    // Find active non-expired session in PostgreSQL
    let session = null;
    let profile = null;

    try {
      session = await queryOne<{ user_id: string; expires_at: string }>(
        `SELECT user_id, expires_at FROM sessions WHERE token = $1`,
        [token]
      );

      if (session && new Date(session.expires_at) >= new Date()) {
        profile = await queryOne<{
          id: string;
          name: string;
          email: string;
          company: string;
          role: UserRole;
          location: string;
          avatar_url: string;
          buyer_profile: any;
          dealer_profile: any;
          logistics_profile: any;
          created_at: string;
        }>(`SELECT * FROM profiles WHERE user_id = $1`, [session.user_id]);
      }
    } catch (dbErr) {
      console.error('/api/auth/me database query error:', dbErr);
    }

    if (profile && session) {
      const userProfile: UserProfile = {
        id: session.user_id,
        name: profile.name,
        email: profile.email,
        company: profile.company,
        role: profile.role,
        location: profile.location || 'India',
        avatarUrl: profile.avatar_url || undefined,
        buyerProfile: profile.buyer_profile || undefined,
        dealerProfile: profile.dealer_profile || undefined,
        logisticsProfile: profile.logistics_profile || undefined,
        createdAt: profile.created_at,
      };

      return NextResponse.json({ user: userProfile });
    }

    return NextResponse.json({ user: null }, { status: 401 });
  } catch (err: any) {
    console.error('/api/auth/me error:', err);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
