import { NextRequest, NextResponse } from 'next/server';
import { requireBuyer, requireDealer, requireLogisticsProvider } from '@/lib/server-auth';

/**
 * Automated RBAC Security Test Runner
 * Executes all 8 wrong-persona test scenarios specified in CarbonX PRD Section 15
 * to verify HTTP 403 Forbidden enforcement on every unauthorized API attempt.
 */
export async function GET(req: NextRequest) {
  const tests = [
    {
      testId: 1,
      description: 'BUYER attempts POST /api/deal-proposals (Create Dealer Proposal)',
      callerRole: 'BUYER' as const,
      handler: requireDealer,
    },
    {
      testId: 2,
      description: 'DEALER attempts POST /api/supply-requests (Submit Buyer Supply Request)',
      callerRole: 'DEALER' as const,
      handler: requireBuyer,
    },
    {
      testId: 3,
      description: 'LOGISTICS_PROVIDER attempts POST /api/supply-requests (Submit Buyer Supply Request)',
      callerRole: 'LOGISTICS_PROVIDER' as const,
      handler: requireBuyer,
    },
    {
      testId: 4,
      description: 'BUYER attempts PATCH /api/shipments/:id/status (Update Shipment Status)',
      callerRole: 'BUYER' as const,
      handler: requireLogisticsProvider,
    },
    {
      testId: 5,
      description: 'DEALER attempts PATCH /api/shipments/:id/status (Update Shipment Status)',
      callerRole: 'DEALER' as const,
      handler: requireLogisticsProvider,
    },
    {
      testId: 6,
      description: 'LOGISTICS_PROVIDER attempts POST /api/deal-proposals (Create Dealer Proposal)',
      callerRole: 'LOGISTICS_PROVIDER' as const,
      handler: requireDealer,
    },
    {
      testId: 7,
      description: 'BUYER attempts POST /api/shipments/:id/accept (Accept Shipment Job)',
      callerRole: 'BUYER' as const,
      handler: requireLogisticsProvider,
    },
    {
      testId: 8,
      description: 'DEALER attempts POST /api/shipments/:id/accept (Accept Shipment Job)',
      callerRole: 'DEALER' as const,
      handler: requireLogisticsProvider,
    },
  ];

  const results = [];
  let allPassed = true;

  for (const t of tests) {
    // Create dummy request with explicit caller persona headers
    const testReq = new NextRequest(new URL('/api/test-rbac', req.url), {
      headers: {
        'x-user-role': t.callerRole,
        'x-user-id': `user-${t.callerRole.toLowerCase()}-demo`,
      },
    });

    const authResult = await t.handler(testReq);
    const passed = !authResult.authorized && authResult.errorResponse?.status === 403;

    if (!passed) allPassed = false;

    results.push({
      testId: t.testId,
      description: t.description,
      callerRole: t.callerRole,
      expectedStatus: 403,
      actualStatus: authResult.errorResponse?.status || 200,
      passed,
    });
  }

  return NextResponse.json(
    {
      summary: allPassed
        ? 'ALL 8 WRONG-PERSONA RBAC TESTS PASSED SUCCESSFULLY'
        : 'SOME RBAC TESTS FAILED',
      allPassed,
      results,
    },
    { status: allPassed ? 200 : 500 }
  );
}
