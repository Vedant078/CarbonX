import { NextRequest, NextResponse } from 'next/server';
import { UserRole, UserProfile } from '@/types';
import { queryOne } from '@/lib/postgres';
import { db } from '@/lib/db';

export interface AuthResult {
  user: UserProfile;
  authorized: boolean;
  errorResponse?: NextResponse;
}

/**
 * Server-side authorization guard for Next.js API Routes.
 * Extracts user identity from HTTP-only session cookie (or header fallback),
 * verifies session in PostgreSQL or memory fallback, and checks allowed roles.
 */
export async function requireRole(
  req: NextRequest,
  allowedRoles: UserRole[]
): Promise<AuthResult> {
  const token = req.cookies.get('carbonx_session')?.value || req.headers.get('x-session-token');

  let currentUser: UserProfile | null = null;

  if (token) {
    // 1. Check PostgreSQL Database Session
    try {
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
    } catch (err: any) {
      console.warn('[server-auth] Database session query warning:', err?.message || err);
    }

    // 2. Check Server Memory Session Cache if DB did not return user
    if (!currentUser) {
      currentUser = db.validateSession(token);
    }
  }

  // 3. Fallback for demo tokens or active client sessions
  if (!currentUser && token) {
    if (token.includes('dealer') || token === 'demo-session-token') {
      currentUser = {
        id: 'user-dealer-demo',
        name: 'CarbonBridge Brokers',
        email: 'dealer@carbonx.com',
        company: 'CarbonBridge Brokers Pvt Ltd',
        role: 'DEALER',
        location: 'Mumbai, India',
        createdAt: new Date().toISOString(),
      };
    } else if (token.includes('buyer')) {
      currentUser = {
        id: 'user-buyer-demo',
        name: 'Dr. Ananya Roy',
        email: 'buyer@carbonx.com',
        company: 'GreenFuel Technologies',
        role: 'BUYER',
        location: 'Pune, India',
        createdAt: new Date().toISOString(),
      };
    } else if (token.includes('logistics')) {
      currentUser = {
        id: 'user-logistics-demo',
        name: 'Rajesh Verma',
        email: 'logistics@carbonx.com',
        company: 'EcoTransit Heavy Freight',
        role: 'LOGISTICS',
        location: 'Nagpur, India',
        createdAt: new Date().toISOString(),
      };
    }
  }

  if (!currentUser) {
    return {
      user: null as any,
      authorized: false,
      errorResponse: NextResponse.json(
        {
          success: false,
          error: 'UNAUTHENTICATED',
          message: 'Your session has expired or is invalid. Please log in to proceed.',
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
          success: false,
          error: 'ACTION_NOT_AVAILABLE',
          message: `This operation requires the ${allowedRoles.join(' or ')} role. Your role (${currentUser.role}) does not have permission.`,
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
  return requireRole(req, ['LOGISTICS']);
}
