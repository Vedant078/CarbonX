import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { pool, query } from './postgres';
import {
  INITIAL_USERS,
  INITIAL_SOURCES,
  INITIAL_REQUIREMENTS,
  INITIAL_DEALS,
  INITIAL_SHIPMENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
} from './seed-data';

export async function initializeDatabase() {
  console.log('Initializing CarbonX PostgreSQL Database...');

  // 1. Read and run schema.sql
  const schemaPath = path.join(process.cwd(), 'src/lib/schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  await pool.query(schemaSql);
  console.log('Schema tables verified/created successfully.');

  // 2. Seed default users & demo accounts with hashed passwords if empty
  const defaultPasswordHash = await bcrypt.hash('Password123!', 10);

  for (const user of INITIAL_USERS) {
    const existingUser = await query(`SELECT id FROM users WHERE email = $1`, [user.email.toLowerCase()]);
    if (existingUser.length === 0) {
      await query(
        `INSERT INTO users (id, email, password_hash, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5)`,
        [user.id, user.email.toLowerCase(), defaultPasswordHash, user.createdAt, user.createdAt]
      );

      await query(
        `INSERT INTO profiles (id, user_id, name, email, company, role, location, avatar_url, buyer_profile, dealer_profile, logistics_profile, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [
          `prof-${user.id}`,
          user.id,
          user.name,
          user.email.toLowerCase(),
          user.company,
          user.role,
          user.location,
          user.avatarUrl || null,
          user.buyerProfile ? JSON.stringify(user.buyerProfile) : null,
          user.dealerProfile ? JSON.stringify(user.dealerProfile) : null,
          user.logisticsProfile ? JSON.stringify(user.logisticsProfile) : null,
          user.createdAt,
          user.createdAt,
        ]
      );
      console.log(`Seeded user: ${user.email} (${user.role})`);
    } else {
      await query(
        `UPDATE users SET password_hash = $1 WHERE email = $2`,
        [defaultPasswordHash, user.email.toLowerCase()]
      );
      await query(
        `UPDATE profiles SET name = $1, company = $2, role = $3 WHERE user_id = $4`,
        [user.name, user.company, user.role, user.id]
      );
    }
  }

  // 3. Seed Carbon Sources if table empty
  const sourcesCount = await query(`SELECT COUNT(*) as count FROM carbon_sources`);
  if (parseInt(sourcesCount[0].count, 10) === 0) {
    for (const src of INITIAL_SOURCES) {
      await query(
        `INSERT INTO carbon_sources (id, company_name, facility_name, industry, location, latitude, longitude, available_quantity, unit, purity, capture_method, price_per_tonne, availability_date, verification_status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
        [
          src.id,
          src.company_name,
          src.facility_name,
          src.industry,
          src.location,
          src.latitude,
          src.longitude,
          src.available_quantity,
          src.unit,
          src.purity,
          src.capture_method,
          src.price_per_tonne,
          src.availability_date,
          src.verification_status,
          src.created_at,
          src.updated_at,
        ]
      );
    }
    console.log(`Seeded ${INITIAL_SOURCES.length} carbon sources.`);
  }

  // 4. Seed Bidding Opportunities if table empty
  const oppsCount = await query(`SELECT COUNT(*) as count FROM bidding_opportunities`);
  if (parseInt(oppsCount[0].count, 10) === 0) {
    const now = new Date();
    const endTime1 = new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString(); // 48h from now
    const endTime2 = new Date(now.getTime() + 72 * 60 * 60 * 1000).toISOString(); // 72h from now

    await query(
      `INSERT INTO bidding_opportunities (id, carbon_source_id, dealer_id, dealer_name, title, description, quantity, unit, starting_price, current_highest_bid, minimum_bid_increment, bid_count, auction_start_time, auction_end_time, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
      [
        'opp-1',
        'source-1',
        'user-dealer-demo',
        'CarbonBridge Trading',
        'Mumbai Steel Works — 500t Amine Scrubbed CO₂ Spot Supply',
        'Competitive bidding for 500 tonnes/month high-purity (99.2%) industrial CO₂ captured from blast furnace unit in Mumbai.',
        500,
        'tonnes',
        4000,
        4250,
        50,
        8,
        now.toISOString(),
        endTime1,
        'LIVE',
        now.toISOString(),
        now.toISOString(),
      ]
    );

    await query(
      `INSERT INTO bidding_opportunities (id, carbon_source_id, dealer_id, dealer_name, title, description, quantity, unit, starting_price, current_highest_bid, minimum_bid_increment, bid_count, auction_start_time, auction_end_time, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
      [
        'opp-2',
        'source-2',
        'user-dealer-demo',
        'CarbonBridge Trading',
        'Gujarat Cement Industries — 800t Flue Gas CO₂ Supply',
        'Competitive bidding for 800 tonnes/month 96.5% CO₂ recovered via calcium looping process in Ahmedabad.',
        800,
        'tonnes',
        3600,
        3800,
        100,
        5,
        now.toISOString(),
        endTime2,
        'LIVE',
        now.toISOString(),
        now.toISOString(),
      ]
    );

    // Seed initial bids for opp-1
    await query(
      `INSERT INTO bids (id, bidding_opportunity_id, bidder_id, bidder_name, bidder_company, amount_per_tonne, quantity, total_amount, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        'bid-demo-1',
        'opp-1',
        'user-buyer-demo',
        'Aarav Mehta',
        'GreenSteel Industries',
        4250,
        300,
        1275000,
        'WINNING',
        now.toISOString(),
        now.toISOString(),
      ]
    );

    console.log('Seeded 2 bidding opportunities and initial demo bids.');
  }

  // 5. Seed Buyer Requirements if table empty
  const reqsCount = await query(`SELECT COUNT(*) as count FROM buyer_requirements`);
  if (parseInt(reqsCount[0].count, 10) === 0) {
    for (const req of INITIAL_REQUIREMENTS) {
      await query(
        `INSERT INTO buyer_requirements (id, buyer_id, buyer_name, title, application, required_quantity, required_purity, location, latitude, longitude, max_distance, max_price, frequency, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
        [
          req.id,
          req.buyer_id,
          req.buyer_name,
          req.title,
          req.application,
          req.required_quantity,
          req.required_purity,
          req.location,
          req.latitude,
          req.longitude,
          req.max_distance,
          req.max_price,
          req.frequency,
          req.status,
          req.created_at,
        ]
      );
    }
    console.log(`Seeded ${INITIAL_REQUIREMENTS.length} buyer requirements.`);
  }

  // 6. Seed Deals if table empty
  const dealsCount = await query(`SELECT COUNT(*) as count FROM facilitated_deals`);
  if (parseInt(dealsCount[0].count, 10) === 0) {
    for (const d of INITIAL_DEALS) {
      await query(
        `INSERT INTO facilitated_deals (id, dealer_id, dealer_name, buyer_id, buyer_name, carbon_source_id, carbon_source_name, requirement_id, quantity, price_per_tonne, total_carbon_value, logistics_cost, total_value, match_score, commission, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)`,
        [
          d.id,
          d.dealer_id || null,
          d.dealer_name || null,
          d.buyer_id,
          d.buyer_name,
          d.carbon_source_id,
          d.carbon_source_name,
          d.requirement_id || null,
          d.quantity,
          d.price_per_tonne,
          d.total_carbon_value,
          d.logistics_cost,
          d.total_value,
          d.match_score,
          d.commission,
          d.status,
          d.created_at,
          d.updated_at,
        ]
      );
    }
    console.log(`Seeded ${INITIAL_DEALS.length} deals.`);
  }

  // 7. Seed Shipments if table empty
  const shipCount = await query(`SELECT COUNT(*) as count FROM logistics_shipments`);
  if (parseInt(shipCount[0].count, 10) === 0) {
    for (const s of INITIAL_SHIPMENTS) {
      await query(
        `INSERT INTO logistics_shipments (id, deal_id, logistics_provider_id, logistics_provider_name, origin, destination, distance_km, quantity, transport_mode, vehicle_type, driver_name, estimated_cost, cost_per_tonne, estimated_delivery_days, pickup_date, estimated_delivery, status, tracking_code, tracking_notes, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)`,
        [
          s.id,
          s.deal_id,
          s.logistics_provider_id || null,
          s.logistics_provider_name || null,
          s.origin,
          s.destination,
          s.distance_km,
          s.quantity,
          s.transport_mode,
          s.vehicle_type,
          s.driver_name,
          s.estimated_cost,
          s.cost_per_tonne,
          s.estimated_delivery_days,
          s.pickup_date || null,
          s.estimated_delivery || null,
          s.status,
          s.tracking_code,
          JSON.stringify(s.tracking_notes),
          s.created_at,
          s.updated_at,
        ]
      );
    }
    console.log(`Seeded ${INITIAL_SHIPMENTS.length} shipments.`);
  }

  // 8. Seed Notifications if table empty
  const notifCount = await query(`SELECT COUNT(*) as count FROM app_notifications`);
  if (parseInt(notifCount[0].count, 10) === 0) {
    for (const n of INITIAL_NOTIFICATIONS) {
      await query(
        `INSERT INTO app_notifications (id, user_id, role_target, title, message, link, read, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [n.id, n.user_id, n.role_target || 'ALL', n.title, n.message, n.link || null, n.read, n.created_at]
      );
    }
  }

  // 9. Seed Audit Logs if table empty
  const auditCount = await query(`SELECT COUNT(*) as count FROM audit_logs`);
  if (parseInt(auditCount[0].count, 10) === 0) {
    for (const a of INITIAL_AUDIT_LOGS) {
      await query(
        `INSERT INTO audit_logs (id, user_id, user_name, role, action, resource, details, timestamp)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [a.id, a.user_id, a.user_name, a.role, a.action, a.resource, a.details || null, a.timestamp]
      );
    }
  }

  console.log('Database initialization complete.');
}

if (require.main === module) {
  initializeDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Failed to initialize database:', err);
      process.exit(1);
    });
}
