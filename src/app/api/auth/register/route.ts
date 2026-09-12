import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { query, queryOne } from '@/lib/postgres';
import { UserRole, UserProfile } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name, company, role, location, buyerProfile, dealerProfile, logisticsProfile } = body;

    if (!email || !password || !name || !company) {
      return NextResponse.json(
        { error: 'MISSING_FIELDS', message: 'Full name, email, password, and company name are required.' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'INVALID_EMAIL', message: 'Please provide a valid work email address.' },
        { status: 400 }
      );
    }

    // Validate password requirements
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'WEAK_PASSWORD', message: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    // Validate role if provided
    let normalizedRole: UserRole | null = null;
    if (role) {
      const upperRole = String(role).toUpperCase();
      if (upperRole === 'BUYER') normalizedRole = 'BUYER';
      else if (upperRole === 'DEALER') normalizedRole = 'DEALER';
      else if (upperRole === 'LOGISTICS' || upperRole === 'LOGISTICS_PROVIDER') normalizedRole = 'LOGISTICS_PROVIDER';
      else {
        return NextResponse.json(
          { error: 'INVALID_ROLE', message: 'Role must be Buyer, Dealer, or Logistics.' },
          { status: 400 }
        );
      }
    }

    // Check existing email
    const existing = await queryOne(`SELECT id FROM users WHERE email = $1`, [email.toLowerCase().trim()]);
    if (existing) {
      return NextResponse.json(
        { error: 'EMAIL_EXISTS', message: 'An account with this email address already exists.' },
        { status: 400 }
      );
    }

    // Hash password with bcryptjs
    const passwordHash = await bcrypt.hash(password, 10);
    const userId = `user-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const profileId = `prof-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const now = new Date().toISOString();

    // Insert user
    await query(
      `INSERT INTO users (id, email, password_hash, created_at, updated_at) VALUES ($1, $2, $3, $4, $5)`,
      [userId, email.toLowerCase().trim(), passwordHash, now, now]
    );

    // Insert profile
    await query(
      `INSERT INTO profiles (id, user_id, name, email, company, role, location, buyer_profile, dealer_profile, logistics_profile, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        profileId,
        userId,
        name.trim(),
        email.toLowerCase().trim(),
        company.trim(),
        normalizedRole,
        location || 'India',
        buyerProfile ? JSON.stringify(buyerProfile) : null,
        dealerProfile ? JSON.stringify(dealerProfile) : null,
        logisticsProfile ? JSON.stringify(logisticsProfile) : null,
        now,
        now,
      ]
    );

    // Create session token
    const token = crypto.randomBytes(32).toString('hex');
    const sessionId = `sess-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days

    await query(
      `INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ($1, $2, $3, $4, $5)`,
      [sessionId, userId, token, expiresAt, now]
    );

    // Audit log
    await query(
      `INSERT INTO audit_logs (id, user_id, user_name, role, action, resource, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        `audit-${Date.now()}`,
        userId,
        name.trim(),
        normalizedRole || 'UNASSIGNED',
        'REGISTER_USER',
        `Registered as ${normalizedRole || 'UNASSIGNED'}`,
        now,
      ]
    );

    const userProfile: UserProfile = {
      id: userId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      company: company.trim(),
      role: normalizedRole as UserRole,
      location: location || 'India',
      buyerProfile,
      dealerProfile,
      logisticsProfile,
      createdAt: now,
    };

    // Set HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set('carbonx_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
    });

    return NextResponse.json({
      success: true,
      user: userProfile,
    });
  } catch (err: any) {
    console.error('Registration API error:', err);
    return NextResponse.json(
      { error: 'SERVER_ERROR', message: 'Registration failed due to a server error.' },
      { status: 500 }
    );
  }
}
