import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { withTransaction, DbConnectionError } from '@/lib/postgres';
import { db } from '@/lib/db';
import { UserRole, UserProfile } from '@/types';

export async function POST(req: NextRequest) {
  const correlationId = `req-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  console.log(`[API POST /api/auth/register ${correlationId}] Registration attempt started`);

  try {
    const body = await req.json().catch(() => ({}));
    const email = body.email;
    const password = body.password;
    const name = body.name || body.fullName;
    const company = body.company || body.companyName;
    const role = body.role;
    const location = body.location;
    const buyerProfile = body.buyerProfile;
    const dealerProfile = body.dealerProfile;
    const logisticsProfile = body.logisticsProfile;

    // 1. Common account field presence validation
    if (!email || !password || !name || !company) {
      return NextResponse.json(
        {
          success: false,
          error: 'MISSING_FIELDS',
          message: 'Full name, work email, password, and company name are required.',
          correlationId,
        },
        { status: 400 }
      );
    }

    const cleanName = String(name).trim();
    const cleanEmail = String(email).toLowerCase().trim();
    const cleanCompany = String(company).trim();
    const cleanLocation = String(location || 'India').trim();

    // 2. Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        {
          success: false,
          error: 'INVALID_EMAIL',
          message: 'Please provide a valid work email address.',
          correlationId,
        },
        { status: 400 }
      );
    }

    // 3. Password requirements validation
    if (typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          error: 'WEAK_PASSWORD',
          message: 'Password must be at least 6 characters long.',
          correlationId,
        },
        { status: 400 }
      );
    }

    // 4. Role normalization & validation (Strictly BUYER, DEALER, LOGISTICS)
    let normalizedRole: UserRole;
    const rawRoleStr = String(role || 'BUYER').toUpperCase().trim();

    if (rawRoleStr === 'BUYER') {
      normalizedRole = 'BUYER';
    } else if (rawRoleStr === 'DEALER') {
      normalizedRole = 'DEALER';
    } else if (rawRoleStr === 'LOGISTICS' || rawRoleStr === 'LOGISTICS_PROVIDER') {
      normalizedRole = 'LOGISTICS';
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'INVALID_ROLE',
          message: 'Please select a valid CarbonX role (Buyer, Dealer, or Logistics).',
          correlationId,
        },
        { status: 400 }
      );
    }

    // 5. Role-specific profile validation & sanitization
    let cleanBuyerProfile: any = undefined;
    let cleanDealerProfile: any = undefined;
    let cleanLogisticsProfile: any = undefined;

    if (normalizedRole === 'BUYER') {
      const industry = String(buyerProfile?.industry || buyerProfile?.primaryApplication || '').trim();
      const estimatedCo2Req = String(buyerProfile?.estimatedCo2Req || buyerProfile?.monthlyRequirement || '').trim();
      const preferredPurity = String(buyerProfile?.preferredPurity || buyerProfile?.requiredPurity || '').trim();
      const preferredDeliveryLocation = String(buyerProfile?.preferredDeliveryLocation || buyerProfile?.preferredLocation || '').trim();

      if (!industry || !estimatedCo2Req || !preferredPurity || !preferredDeliveryLocation) {
        return NextResponse.json(
          {
            success: false,
            error: 'VALIDATION_ERROR',
            message: 'Please fill in all required Buyer profile fields (Industry, CO₂ requirement, purity, delivery location).',
            correlationId,
          },
          { status: 400 }
        );
      }

      cleanBuyerProfile = {
        industry,
        primaryApplication: industry,
        estimatedCo2Req,
        monthlyRequirement: estimatedCo2Req,
        preferredPurity,
        requiredPurity: preferredPurity,
        preferredDeliveryLocation,
        preferredLocation: preferredDeliveryLocation,
        usageObjective: buyerProfile?.usageObjective ? String(buyerProfile.usageObjective).trim() : undefined,
        sustainabilityGoals: buyerProfile?.sustainabilityGoals ? String(buyerProfile.sustainabilityGoals).trim() : undefined,
      };
    } else if (normalizedRole === 'DEALER') {
      const tradingName = String(dealerProfile?.tradingName || dealerProfile?.organizationType || cleanCompany).trim();
      const businessCategory = String(dealerProfile?.businessCategory || '').trim();
      const areasServed = String(dealerProfile?.areasServed || dealerProfile?.operatingRegion || '').trim();
      const industriesServed = String(dealerProfile?.industriesServed || '').trim();

      if (!tradingName || !businessCategory || !areasServed || !industriesServed) {
        return NextResponse.json(
          {
            success: false,
            error: 'VALIDATION_ERROR',
            message: 'Please fill in all required Dealer profile fields (Trading name, business category, areas served, industries served).',
            correlationId,
          },
          { status: 400 }
        );
      }

      cleanDealerProfile = {
        tradingName,
        businessCategory,
        organizationType: businessCategory,
        areasServed,
        operatingRegion: areasServed,
        industriesServed,
        commercialExperience: dealerProfile?.commercialExperience ? String(dealerProfile.commercialExperience).trim() : undefined,
        businessDescription: dealerProfile?.businessDescription ? String(dealerProfile.businessDescription).trim() : undefined,
      };
    } else if (normalizedRole === 'LOGISTICS') {
      const logisticsCompanyName = String(logisticsProfile?.logisticsCompanyName || cleanCompany).trim();
      const serviceRegions = String(logisticsProfile?.serviceRegions || logisticsProfile?.serviceRegion || '').trim();
      const co2TransportCapability = String(logisticsProfile?.co2TransportCapability || '').trim();
      const approxCapacity = String(logisticsProfile?.approxCapacity || '').trim();

      if (!logisticsCompanyName || !serviceRegions || !co2TransportCapability || !approxCapacity) {
        return NextResponse.json(
          {
            success: false,
            error: 'VALIDATION_ERROR',
            message: 'Please fill in all required Logistics profile fields (Logistics company name, service regions, transport capability, capacity).',
            correlationId,
          },
          { status: 400 }
        );
      }

      cleanLogisticsProfile = {
        logisticsCompanyName,
        serviceRegions,
        serviceRegion: serviceRegions,
        co2TransportCapability,
        approxCapacity,
        transportModes: logisticsProfile?.transportModes ? String(logisticsProfile.transportModes).trim() : undefined,
        fleetInformation: logisticsProfile?.fleetInformation ? String(logisticsProfile.fleetInformation).trim() : undefined,
      };
    }

    // Hash password securely
    const passwordHash = await bcrypt.hash(password, 10);
    const userId = `user-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const profileId = `prof-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const sessionId = `sess-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const token = crypto.randomBytes(32).toString('hex');
    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const userProfile: UserProfile = {
      id: userId,
      name: cleanName,
      email: cleanEmail,
      company: cleanCompany,
      role: normalizedRole,
      location: cleanLocation,
      buyerProfile: cleanBuyerProfile,
      dealerProfile: cleanDealerProfile,
      logisticsProfile: cleanLogisticsProfile,
      createdAt: now,
    };

    // 6. ATOMIC TRANSACTION (PostgreSQL Primary + In-Memory Fallback)
    let registeredInPg = false;
    try {
      await withTransaction(async (client) => {
        // Unique email check inside transaction
        const existingRes = await client.query(`SELECT id FROM users WHERE email = $1`, [cleanEmail]);
        if (existingRes.rows.length > 0) {
          const dupErr: any = new Error('An account with this email address already exists. Please sign in instead.');
          dupErr.code = 'EMAIL_EXISTS';
          throw dupErr;
        }

        // Insert user record
        await client.query(
          `INSERT INTO users (id, email, password_hash, created_at, updated_at) VALUES ($1, $2, $3, $4, $5)`,
          [userId, cleanEmail, passwordHash, now, now]
        );

        // Insert profile record
        await client.query(
          `INSERT INTO profiles (id, user_id, name, email, company, role, location, buyer_profile, dealer_profile, logistics_profile, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          [
            profileId,
            userId,
            cleanName,
            cleanEmail,
            cleanCompany,
            normalizedRole,
            cleanLocation,
            cleanBuyerProfile ? JSON.stringify(cleanBuyerProfile) : null,
            cleanDealerProfile ? JSON.stringify(cleanDealerProfile) : null,
            cleanLogisticsProfile ? JSON.stringify(cleanLogisticsProfile) : null,
            now,
            now,
          ]
        );

        // Insert session record
        await client.query(
          `INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES ($1, $2, $3, $4, $5)`,
          [sessionId, userId, token, expiresAt, now]
        );

        // Insert audit log
        await client.query(
          `INSERT INTO audit_logs (id, user_id, user_name, role, action, resource, timestamp)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            `audit-${Date.now()}`,
            userId,
            cleanName,
            normalizedRole,
            'REGISTER_USER',
            `Registered as ${normalizedRole}`,
            now,
          ]
        );
      });
      registeredInPg = true;
      console.log(`[API POST /api/auth/register ${correlationId}] PostgreSQL transaction committed for user ${userId}`);
    } catch (dbErr: any) {
      if (dbErr?.code === 'EMAIL_EXISTS' || dbErr?.code === '23505') {
        return NextResponse.json(
          {
            success: false,
            error: 'DUPLICATE_EMAIL',
            message: 'An account with this email address already exists. Please sign in instead.',
            correlationId,
          },
          { status: 400 }
        );
      }

      console.warn(`[API POST /api/auth/register ${correlationId}] PostgreSQL unreachable (${dbErr?.message}). Engaging resilient in-memory session fallback...`);
      await db.registerUser(userProfile);
    }

    // Set HTTP-only cookie
    try {
      const cookieStore = await cookies();
      cookieStore.set('carbonx_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 30 * 24 * 60 * 60,
      });
    } catch {
      // Ignore when outside Next.js request context
    }

    return NextResponse.json({
      success: true,
      user: userProfile,
      correlationId,
    });
  } catch (err: any) {
    console.error(`[${correlationId}] Unexpected Registration Technical Failure:`, {
      message: err?.message || err,
      stack: err?.stack,
    });

    return NextResponse.json(
      {
        success: false,
        error: 'SERVER_ERROR',
        message: 'Registration could not be completed. Please check your inputs and try again.',
        correlationId,
      },
      { status: 500 }
    );
  }
}
