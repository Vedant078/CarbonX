import { NextRequest, NextResponse } from 'next/server';
import { UserRole, UserProfile } from '@/types';
import { queryOne } from '@/lib/postgres';

export interface AuthResult {
  user: UserProfile;
  authorized: boolean;
  errorResponse?: NextResponse;
}

/**
 * Server-side authorization guard for Next.js API Routes.
 * Extracts user identity from HTTP-only session cookie (or header fallback),
 * verifies session in PostgreSQL, and checks allowed roles.
 */
export async function requireRole(
  req: NextRequest,
  allowedRoles: UserRole[]
): Promise<AuthResult> {
  const token = req.cookies.get('carbonx_session')?.value || req.headers.get('x-session-token');

  let currentUser: UserProfile | null = null;

  if (token) {
    const session = await queryOne<{ user_id: string; expires_at: string }>(
      `SELECT user_id, expires_at FROM sessions WHERE token = $1`,
      [token]
    );

    if (session && new Date(session.expires_at) > new Date()) {
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
      }>(`SELECT * FROM profiles WHERE user_id = $1`, [session.user_id]);

      if (profile) {
        currentUser = {
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
      }
    }
  }

  if (!currentUser) {
    return {
      user: null as any,
      authorized: false,
      errorResponse: NextResponse.json(
        {
          error: 'UNAUTHENTICATED',
          message: 'Authentication required. Please log in to proceed.',
        },
        { status: 401 }
      ),
    };
  }

  if (!currentUser.role || !allowedRoles.includes(currentUser.role)) {
    return {
      user: currentUser,
      authorized: false,
      errorResponse: NextResponse.json(
        {
          error: 'ACTION_NOT_AVAILABLE',
          message: 'This operation is not authorized for your assigned CarbonX role.',
          userRole: currentUser.role,
          requiredRoles: allowedRoles,
        },
        { status: 403 }
      ),
    };
  }

  return {
    user: currentUser,
    authorized: true,
  };
}

export async function requireBuyer(req: NextRequest): Promise<AuthResult> {
  return requireRole(req, ['BUYER']);
}

export async function requireDealer(req: NextRequest): Promise<AuthResult> {
  return requireRole(req, ['DEALER']);
}

export async function requireLogisticsProvider(req: NextRequest): Promise<AuthResult> {
  return requireRole(req, ['LOGISTICS_PROVIDER']);
}
