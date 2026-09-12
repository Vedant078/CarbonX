import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query, queryOne } from '@/lib/postgres';
import { UserRole, UserProfile } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('carbonx_session')?.value;

    if (!token) {
      return NextResponse.json({ error: 'UNAUTHORIZED', message: 'Authentication required.' }, { status: 401 });
    }

    const session = await queryOne<{ user_id: string }>(
      `SELECT user_id FROM sessions WHERE token = $1 AND expires_at > CURRENT_TIMESTAMP`,
      [token]
    );

    if (!session) {
      return NextResponse.json({ error: 'UNAUTHORIZED', message: 'Session expired or invalid.' }, { status: 401 });
    }

    const { role } = await req.json();
    let normalizedRole: UserRole;

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

    // Check if user already has a role
    const currentProfile = await queryOne<{ role: UserRole }>(
      `SELECT role FROM profiles WHERE user_id = $1`,
      [session.user_id]
    );

    if (currentProfile?.role) {
      return NextResponse.json(
        { error: 'ROLE_ALREADY_SET', message: 'Your account role is already assigned.' },
        { status: 400 }
      );
    }

    // Update role in PostgreSQL
    const now = new Date().toISOString();
    await query(
      `UPDATE profiles SET role = $1, updated_at = $2 WHERE user_id = $3`,
      [normalizedRole, now, session.user_id]
    );

    // Audit log
    await query(
      `INSERT INTO audit_logs (id, user_id, user_name, role, action, resource, timestamp)
       VALUES ($1, $2, (SELECT name FROM profiles WHERE user_id = $2), $3, $4, $5, $6)`,
      [
        `audit-${Date.now()}`,
        session.user_id,
        normalizedRole,
        'ASSIGN_ROLE',
        `Assigned role ${normalizedRole}`,
        now,
      ]
    );

    // Fetch updated user profile
    const profile = await queryOne<{
      id: string;
      name: string;
      email: string;
      company: string;
      role: UserRole;
      location: string;
      avatar_url: string;
      created_at: string;
    }>(`SELECT * FROM profiles WHERE user_id = $1`, [session.user_id]);

    const userProfile: UserProfile = {
      id: session.user_id,
      name: profile!.name,
      email: profile!.email,
      company: profile!.company,
      role: profile!.role,
      location: profile!.location || 'India',
      avatarUrl: profile!.avatar_url || undefined,
      createdAt: profile!.created_at,
    };

    let targetRoute = '/buyer/dashboard';
    if (normalizedRole === 'DEALER') targetRoute = '/dealer/dashboard';
    else if (normalizedRole === 'LOGISTICS_PROVIDER') targetRoute = '/logistics/dashboard';

    return NextResponse.json({
      success: true,
      user: userProfile,
      targetRoute,
    });
  } catch (err: any) {
    console.error('Select role error:', err);
    return NextResponse.json({ error: 'SERVER_ERROR', message: 'Role assignment failed.' }, { status: 500 });
  }
}
