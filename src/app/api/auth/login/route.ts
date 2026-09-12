import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { query, queryOne } from '@/lib/postgres';
import { UserProfile, UserRole } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, isDemo } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'MISSING_FIELDS', message: 'Email address is required.' },
        { status: 400 }
      );
    }

    const cleanedEmail = String(email).toLowerCase().trim();

    // Look up user in PostgreSQL
    const user = await queryOne<{ id: string; email: string; password_hash: string }>(
      `SELECT id, email, password_hash FROM users WHERE email = $1`,
      [cleanedEmail]
    );

    if (!user) {
      return NextResponse.json(
        { error: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // If password provided and not demo auto-login, verify bcrypt hash
    if (password && !isDemo) {
      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) {
        return NextResponse.json(
          { error: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' },
          { status: 401 }
        );
      }
    } else if (!isDemo && !password) {
      return NextResponse.json(
        { error: 'MISSING_FIELDS', message: 'Password is required.' },
        { status: 400 }
      );
    }

    // Get user profile
    const profile = await queryOne<{
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
    }>(`SELECT * FROM profiles WHERE user_id = $1`, [user.id]);

    if (!profile) {
      return NextResponse.json(
        { error: 'PROFILE_NOT_FOUND', message: 'User profile not found.' },
        { status: 404 }
      );
    }

    // Create secure session token in PostgreSQL
    const token = crypto.randomBytes(32).toString('hex');
    const sessionId = `sess-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    await query(
      `INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ($1, $2, $3, $4, $5)`,
      [sessionId, user.id, token, expiresAt, now]
    );

    // Set HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set('carbonx_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
    });

    const userProfile: UserProfile = {
      id: user.id,
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

    let targetRoute = '/select-role';
    if (profile.role === 'BUYER') targetRoute = '/buyer/dashboard';
    else if (profile.role === 'DEALER') targetRoute = '/dealer/dashboard';
    else if (profile.role === 'LOGISTICS_PROVIDER') targetRoute = '/logistics/dashboard';

    return NextResponse.json({
      success: true,
      user: userProfile,
      targetRoute,
    });
  } catch (err: any) {
    console.error('Login API error:', err);
    return NextResponse.json(
      { error: 'SERVER_ERROR', message: 'Login failed due to a server error.' },
      { status: 500 }
    );
  }
}
