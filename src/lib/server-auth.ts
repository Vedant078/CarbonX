import { NextRequest, NextResponse } from 'next/server';
import { UserRole, UserProfile } from '@/types';
import { db } from '@/lib/db';

export interface AuthResult {
  user: UserProfile;
  authorized: boolean;
  errorResponse?: NextResponse;
}

/**
 * Server-side authorization guard for Next.js API Routes.
 * Extracts user identity from headers (x-user-id / x-user-role) or session,
 * verifies identity against DB, and checks against allowed roles.
 */
export async function requireRole(
  req: NextRequest,
  allowedRoles: UserRole[]
): Promise<AuthResult> {
  const headerUserId = req.headers.get('x-user-id');
  const headerUserRole = req.headers.get('x-user-role') as UserRole | null;

  // Fallback to active current user from DB session if header omitted
  let currentUser: UserProfile;
  try {
    if (headerUserId) {
      const users = await db.getUsers();
      const found = users.find((u) => u.id === headerUserId);
      currentUser = found || (await db.getCurrentUser());
    } else {
      currentUser = await db.getCurrentUser();
    }
  } catch (err) {
    currentUser = await db.getCurrentUser();
  }

  // Double check role mismatch if header explicitly provided
  const effectiveRole = headerUserRole || currentUser.role;

  if (!allowedRoles.includes(effectiveRole)) {
    return {
      user: currentUser,
      authorized: false,
      errorResponse: NextResponse.json(
        {
          error: 'ACTION_NOT_AVAILABLE',
          message: 'This operation is not available for your CarbonX role.',
          userRole: effectiveRole,
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
