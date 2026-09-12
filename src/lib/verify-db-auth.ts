import { pool, query, queryOne } from './postgres';
import bcrypt from 'bcryptjs';

async function verifyAuth() {
  console.log("=== CARBONX DB AUTHENTICATION VERIFICATION ===");
  try {
    // 1. Connection check
    const testResult = await query('SELECT 1 as test');
    console.log("1. PostgreSQL Health Check (SELECT 1): OK", testResult);

    // 2. Schema check
    const tables = await query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log("2. Tables present in PostgreSQL 'carbonx':", tables.map(t => t.table_name).join(', '));

    // 3. User records & demo accounts
    const demoEmails = [
      'buyer.demo@carbonx.demo',
      'dealer.demo@carbonx.demo',
      'logistics.demo@carbonx.demo'
    ];

    for (const email of demoEmails) {
      const user = await queryOne(`SELECT id, email, password_hash FROM users WHERE email = $1`, [email]);
      if (!user) {
        console.error(`❌ Missing user record for: ${email}`);
        continue;
      }
      const profile = await queryOne(`SELECT id, name, company, role FROM profiles WHERE user_id = $1`, [user.id]);
      if (!profile) {
        console.error(`❌ Missing profile record for: ${email}`);
        continue;
      }

      // Check password hash verification with 'password123' and 'Password123!'
      const match1 = await bcrypt.compare('password123', user.password_hash);
      const match2 = await bcrypt.compare('Password123!', user.password_hash);
      
      console.log(`✅ Demo Account Verified: ${email}`);
      console.log(`   - ID: ${user.id}`);
      console.log(`   - Role: ${profile.role}`);
      console.log(`   - Company: ${profile.company}`);
      console.log(`   - Password 'password123' match: ${match1}`);
      console.log(`   - Password 'Password123!' match: ${match2}`);
    }

  } catch (err) {
    console.error("❌ Authentication Verification Failed:", err);
  } finally {
    await pool.end();
  }
}

verifyAuth();
