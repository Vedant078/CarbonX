import {
  UserProfile,
  UserRole,
  CarbonSource,
  BuyerRequirement,
  MatchRecord,
  FacilitatedDeal,
  LogisticsShipment,
  ShipmentStatus,
  AppNotification,
  AuditLog,
  AnalyticsSummary,
  BiddingOpportunity,
  Bid,
  BiddingOpportunityStatus,
  BidStatus,
} from '@/types';
import { query, queryOne } from './postgres';
import { calculateMatch } from './matching';
import { generateLogisticsEstimate } from './logistics';
import { db } from './db';

export class CarbonXServerDatabase {
  // --- USERS & PROFILES ---
  async getUsers(): Promise<UserProfile[]> {
    try {
      const rows = await query(`SELECT * FROM profiles ORDER BY created_at ASC`);
      return rows.map((p) => ({
        id: p.user_id,
        name: p.name,
        email: p.email,
        company: p.company,
        role: p.role as UserRole,
        location: p.location || 'India',
        avatarUrl: p.avatar_url || undefined,
        buyerProfile: p.buyer_profile || undefined,
        dealerProfile: p.dealer_profile || undefined,
        logisticsProfile: p.logistics_profile || undefined,
        createdAt: p.created_at,
      }));
    } catch {
      return [];
    }
  }

  // --- MARKETPLACE SOURCES ---
  async getSources(): Promise<CarbonSource[]> {
    try {
      return await query(`SELECT * FROM carbon_sources ORDER BY created_at DESC`);
    } catch {
      return [];
    }
  }

  async getSourceById(id: string): Promise<CarbonSource | undefined> {
    try {
      const row = await queryOne(`SELECT * FROM carbon_sources WHERE id = $1`, [id]);
      if (row) return row;
      return db.getSourceById(id);
    } catch {
      return db.getSourceById(id);
    }
  }

  async createListing(data: any): Promise<CarbonSource> {
    const id = `src-${Date.now()}`;
    const now = new Date().toISOString();
    const newSource: CarbonSource = {
      id,
      company_name: data.company_name || data.supplier_name || 'Industrial Emitter',
      facility_name: data.facility_name || data.title || 'Capture Plant',
      industry: data.industry || data.source_type || 'Cement',
      location: data.location || 'Mumbai, MH',
      latitude: data.latitude || 19.0760,
      longitude: data.longitude || 72.8777,
      available_quantity: Number(data.available_quantity || data.capacity || 500),
      unit: 'tonnes/month',
      purity: Number(data.purity || 99.5),
      capture_method: data.capture_method || 'Post-combustion Amine Scrubbing',
      price_per_tonne: Number(data.price_per_tonne || 4200),
      availability_date: data.availability_date || now.split('T')[0],
      verification_status: 'VERIFIED',
      created_at: now,
      updated_at: now,
    };

    await query(
      `INSERT INTO carbon_sources (id, company_name, facility_name, industry, location, latitude, longitude, available_quantity, unit, purity, capture_method, price_per_tonne, availability_date, verification_status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
      [
        newSource.id,
        newSource.company_name,
        newSource.facility_name,
        newSource.industry,
        newSource.location,
        newSource.latitude,
        newSource.longitude,
        newSource.available_quantity,
        newSource.unit,
        newSource.purity,
        newSource.capture_method,
        newSource.price_per_tonne,
        newSource.availability_date,
        newSource.verification_status,
        now,
        now,
      ]
    );
    return newSource;
  }

  private memoryBiddingOpportunities: BiddingOpportunity[] = [];
  private memoryBids: Bid[] = [];

  // --- B2B COMPETITIVE BIDDING ---
  async getBiddingOpportunities(): Promise<BiddingOpportunity[]> {
    const sources = await this.getSources();
    let dbOpps: BiddingOpportunity[] = [];

    try {
      const now = new Date().toISOString();
      // Auto-expire opportunities past auction_end_time safely
      await query(
        `UPDATE bidding_opportunities SET status = 'ENDED', updated_at = $1 WHERE status = 'LIVE' AND auction_end_time <= $1`,
        [now]
      );

      const rows = await query(`SELECT * FROM bidding_opportunities ORDER BY created_at DESC`);
      dbOpps = rows.map((r) => {
        let src = sources.find((s) => s.id === r.carbon_source_id);
        if (!src) {
          src = {
            id: r.carbon_source_id || 'source-1',
            company_name: r.dealer_name || 'CarbonBridge Trading',
            facility_name: r.title || 'CO₂ Capture Facility',
            industry: 'Steel' as any,
            location: 'Mumbai, Maharashtra',
            latitude: 19.076,
            longitude: 72.8777,
            available_quantity: Number(r.quantity),
            unit: 'tonnes/month',
            purity: 99.2,
            capture_method: 'Post-combustion Amine Scrubbing',
            price_per_tonne: Number(r.starting_price),
            availability_date: new Date().toISOString().split('T')[0],
            verification_status: 'VERIFIED',
            created_at: r.created_at,
            updated_at: r.updated_at,
          };
        }

        return {
          ...r,
          starting_price: Number(r.starting_price),
          current_highest_bid: Number(r.current_highest_bid),
          minimum_bid_increment: Number(r.minimum_bid_increment),
          quantity: Number(r.quantity),
          bid_count: Number(r.bid_count),
          source: src,
        };
      });
    } catch (err: any) {
      console.warn('[server-db] PostgreSQL query failed for getBiddingOpportunities (using memory store fallback):', err?.message || err);
    }

    // Merge PostgreSQL rows with memory fallback rows (prevent duplicates)
    const oppMap = new Map<string, BiddingOpportunity>();
    
    // Add memory fallback entries first
    for (const memOpp of this.memoryBiddingOpportunities) {
      let src = memOpp.source || sources.find((s) => s.id === memOpp.carbon_source_id);
      if (!src) {
        src = {
          id: memOpp.carbon_source_id || 'source-1',
          company_name: memOpp.dealer_name || 'CarbonBridge Trading',
          facility_name: memOpp.title || 'CO₂ Capture Facility',
          industry: 'Steel' as any,
          location: 'Mumbai, Maharashtra',
          latitude: 19.076,
          longitude: 72.8777,
          available_quantity: memOpp.quantity,
          unit: 'tonnes/month',
          purity: 99.2,
          capture_method: 'Post-combustion Amine Scrubbing',
          price_per_tonne: memOpp.starting_price,
          availability_date: new Date().toISOString().split('T')[0],
          verification_status: 'VERIFIED',
          created_at: memOpp.created_at,
          updated_at: memOpp.updated_at,
        };
      }
      oppMap.set(memOpp.id, { ...memOpp, source: src });
    }

    // DB rows take precedence when available
    for (const dbOpp of dbOpps) {
      oppMap.set(dbOpp.id, dbOpp);
    }

    // Sort by created_at descending
    return Array.from(oppMap.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  async getBiddingOpportunityById(id: string): Promise<BiddingOpportunity | undefined> {
    const opps = await this.getBiddingOpportunities();
    return opps.find((o) => o.id === id);
  }

  async createBiddingOpportunity(data: {
    carbon_source_id: string;
    dealer_id?: string;
    dealer_name?: string;
    title?: string;
    description?: string;
    quantity: number;
    starting_price: number;
    minimum_bid_increment?: number;
    duration_hours?: number;
  }): Promise<BiddingOpportunity> {
    const fetchedSource = await this.getSourceById(data.carbon_source_id);
    const source: CarbonSource = fetchedSource || {
      id: data.carbon_source_id,
      company_name: data.dealer_name || 'CarbonBridge Trading',
      facility_name: 'CO₂ Capture Unit',
      industry: 'Steel' as any,
      location: 'Mumbai, Maharashtra',
      latitude: 19.076,
      longitude: 72.8777,
      available_quantity: data.quantity,
      unit: 'tonnes/month',
      purity: 99.2,
      capture_method: 'Post-combustion Amine Scrubbing',
      price_per_tonne: data.starting_price,
      availability_date: new Date().toISOString().split('T')[0],
      verification_status: 'VERIFIED',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const now = new Date();
    const durationHours = data.duration_hours || 48;
    const endTime = new Date(now.getTime() + durationHours * 60 * 60 * 1000).toISOString();
    const oppId = `opp-${Date.now()}`;
    const increment = data.minimum_bid_increment || 50;

    const newOpp: BiddingOpportunity = {
      id: oppId,
      carbon_source_id: source.id,
      dealer_id: data.dealer_id || 'user-dealer-demo',
      dealer_name: data.dealer_name || 'CarbonBridge Trading',
      title: data.title || `${source.company_name} — ${data.quantity}t ${source.industry} CO₂ Supply Opportunity`,
      description: data.description || `Competitive bidding for ${data.quantity} tonnes/month ${source.purity}% purity CO₂ captured in ${source.location}.`,
      quantity: Number(data.quantity),
      unit: 'tonnes',
      starting_price: Number(data.starting_price),
      current_highest_bid: Number(data.starting_price),
      minimum_bid_increment: Number(increment),
      bid_count: 0,
      auction_start_time: now.toISOString(),
      auction_end_time: endTime,
      status: 'LIVE',
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      source,
    };

    // Store in memory fallback list immediately so buyers can see it regardless of DB status
    this.memoryBiddingOpportunities.unshift(newOpp);

    try {
      await query(
        `INSERT INTO bidding_opportunities (id, carbon_source_id, dealer_id, dealer_name, title, description, quantity, unit, starting_price, current_highest_bid, minimum_bid_increment, bid_count, auction_start_time, auction_end_time, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
        [
          newOpp.id,
          newOpp.carbon_source_id,
          newOpp.dealer_id,
          newOpp.dealer_name,
          newOpp.title,
          newOpp.description,
          newOpp.quantity,
          newOpp.unit,
          newOpp.starting_price,
          newOpp.current_highest_bid,
          newOpp.minimum_bid_increment,
          0,
          newOpp.auction_start_time,
          newOpp.auction_end_time,
          newOpp.status,
          newOpp.created_at,
          newOpp.updated_at,
        ]
      );
    } catch (err: any) {
      console.warn('[server-db] PostgreSQL insertion failed for createBiddingOpportunity (fallback active):', err?.message || err);
    }

    try {
      await this.logAudit(
        data.dealer_id || 'user-dealer-demo',
        data.dealer_name || 'CarbonBridge Trading',
        'DEALER',
        'CREATE_BIDDING_OPPORTUNITY',
        `Published bidding opportunity ${newOpp.id} for ${source.company_name}`
      );
    } catch {}

    return newOpp;
  }

  async updateBiddingOpportunity(
    id: string,
    dealerId: string,
    updates: {
      title?: string;
      description?: string;
      quantity?: number;
      starting_price?: number;
      minimum_bid_increment?: number;
      duration_hours?: number;
      status?: BiddingOpportunityStatus;
    }
  ): Promise<BiddingOpportunity> {
    const opp = await this.getBiddingOpportunityById(id);
    if (!opp) throw new Error('Bidding opportunity not found.');
    if (opp.dealer_id && opp.dealer_id !== dealerId) {
      throw new Error('Unauthorized: You do not own this bidding opportunity.');
    }

    const now = new Date().toISOString();
    const updatedTitle = updates.title !== undefined ? updates.title.trim() : opp.title;
    const updatedDesc = updates.description !== undefined ? updates.description.trim() : opp.description;
    const updatedQty = updates.quantity !== undefined ? Number(updates.quantity) : opp.quantity;
    const updatedPrice = updates.starting_price !== undefined ? Number(updates.starting_price) : opp.starting_price;
    const updatedIncrement = updates.minimum_bid_increment !== undefined ? Number(updates.minimum_bid_increment) : opp.minimum_bid_increment;
    const updatedStatus = updates.status !== undefined ? updates.status : opp.status;
    let updatedEndTime = opp.auction_end_time;

    if (updates.duration_hours !== undefined) {
      const dur = Number(updates.duration_hours);
      if (!isNaN(dur) && dur > 0) {
        updatedEndTime = new Date(new Date().getTime() + dur * 60 * 60 * 1000).toISOString();
      }
    }

    const updatedOpp: BiddingOpportunity = {
      ...opp,
      title: updatedTitle,
      description: updatedDesc,
      quantity: updatedQty,
      starting_price: updatedPrice,
      minimum_bid_increment: updatedIncrement,
      status: updatedStatus,
      auction_end_time: updatedEndTime,
      updated_at: now,
    };

    // Update memory fallback array
    const memIdx = this.memoryBiddingOpportunities.findIndex((o) => o.id === id);
    if (memIdx !== -1) {
      this.memoryBiddingOpportunities[memIdx] = updatedOpp;
    } else {
      this.memoryBiddingOpportunities.unshift(updatedOpp);
    }

    // Update PostgreSQL
    try {
      await query(
        `UPDATE bidding_opportunities 
         SET title = $1, description = $2, quantity = $3, starting_price = $4, minimum_bid_increment = $5, status = $6, auction_end_time = $7, updated_at = $8 
         WHERE id = $9 AND (dealer_id = $10 OR dealer_id IS NULL)`,
        [
          updatedTitle,
          updatedDesc,
          updatedQty,
          updatedPrice,
          updatedIncrement,
          updatedStatus,
          updatedEndTime,
          now,
          id,
          dealerId,
        ]
      );
    } catch (err: any) {
      console.warn('[server-db] PostgreSQL update failed for updateBiddingOpportunity (memory updated):', err?.message || err);
    }

    return updatedOpp;
  }

  async cancelBiddingOpportunity(id: string, dealerId: string): Promise<BiddingOpportunity> {
    return this.updateBiddingOpportunity(id, dealerId, { status: 'CANCELLED' });
  }

  async placeBidAtomic(
    opportunityId: string,
    bidder: UserProfile,
    amountPerTonne: number,
    quantity: number
  ): Promise<{ bid: Bid; opportunity: BiddingOpportunity }> {
    const opp = await this.getBiddingOpportunityById(opportunityId);
    if (!opp) throw new Error('Bidding opportunity not found.');

    // Prevent Dealers from bidding on their own auction
    if (opp.dealer_id && opp.dealer_id === bidder.id) {
      throw new Error('Dealers cannot place bids on their own CO₂ auction.');
    }

    const now = new Date();
    if (opp.status !== 'LIVE' || new Date(opp.auction_end_time) <= now) {
      throw new Error('This competitive bidding opportunity is closed or expired.');
    }

    // Minimum required bid calculation
    const minRequired =
      opp.bid_count === 0
        ? opp.starting_price
        : opp.current_highest_bid + opp.minimum_bid_increment;

    if (amountPerTonne < minRequired) {
      throw new Error(`Your bid must be at least ₹${minRequired.toLocaleString('en-IN')} per tonne.`);
    }

    if (quantity > opp.quantity) {
      throw new Error(`Requested quantity (${quantity}t) exceeds opportunity quantity (${opp.quantity}t).`);
    }

    const totalAmount = amountPerTonne * quantity;
    const bidId = `bid-${Date.now()}`;
    const timestamp = now.toISOString();

    // 1. Mark previous WINNING bids for this opportunity as OUTBID
    try {
      const previousWinningBids = await query<{ id: string; bidder_id: string; bidder_company: string; amount_per_tonne: number }>(
        `SELECT id, bidder_id, bidder_company, amount_per_tonne FROM bids WHERE bidding_opportunity_id = $1 AND status = 'WINNING'`,
        [opportunityId]
      );

      await query(
        `UPDATE bids SET status = 'OUTBID', updated_at = $1 WHERE bidding_opportunity_id = $2 AND status = 'WINNING'`,
        [timestamp, opportunityId]
      );

      // 2. Insert new WINNING bid
      await query(
        `INSERT INTO bids (id, bidding_opportunity_id, bidder_id, bidder_name, bidder_company, amount_per_tonne, quantity, total_amount, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          bidId,
          opportunityId,
          bidder.id,
          bidder.name,
          bidder.company,
          amountPerTonne,
          quantity,
          totalAmount,
          'WINNING',
          timestamp,
          timestamp,
        ]
      );

      // 3. Update opportunity current_highest_bid & bid_count in DB
      await query(
        `UPDATE bidding_opportunities SET current_highest_bid = $1, bid_count = bid_count + 1, updated_at = $2 WHERE id = $3`,
        [amountPerTonne, timestamp, opportunityId]
      );

      // 4. Send OUTBID notifications to previous bidders
      for (const prevBid of previousWinningBids) {
        if (prevBid.bidder_id !== bidder.id) {
          await this.createNotification({
            user_id: prevBid.bidder_id,
            role_target: 'BUYER',
            title: 'You Have Been Outbid!',
            message: `Your bid of ₹${prevBid.amount_per_tonne}/t on "${opp.title}" was outbid. Current leading bid is ₹${amountPerTonne}/t.`,
            link: `/marketplace/bidding/${opportunityId}`,
          });
        }
      }
    } catch (err: any) {
      console.warn('[server-db] PostgreSQL operations failed for placeBidAtomic (using memory fallback):', err?.message || err);
    }

    // Update memory fallback state
    for (const memBid of this.memoryBids) {
      if (memBid.bidding_opportunity_id === opportunityId && memBid.status === 'WINNING') {
        memBid.status = 'OUTBID';
        memBid.updated_at = timestamp;
      }
    }

    // Update opportunity inside memory fallback
    const memOpp = this.memoryBiddingOpportunities.find((o) => o.id === opportunityId);
    if (memOpp) {
      memOpp.current_highest_bid = amountPerTonne;
      memOpp.bid_count += 1;
      memOpp.updated_at = timestamp;
    }

    // Send notification to Dealer
    try {
      await this.createNotification({
        user_id: opp.dealer_id || 'user-dealer-demo',
        role_target: 'DEALER',
        title: 'New Leading Bid Submitted',
        message: `${bidder.company} submitted a leading bid of ₹${amountPerTonne}/t (${quantity}t) on "${opp.title}".`,
        link: `/dealer/opportunities/${opportunityId}`,
      });

      await this.logAudit(
        bidder.id,
        bidder.name,
        'BUYER',
        'PLACE_BID',
        `Placed bid ₹${amountPerTonne}/t on opportunity ${opportunityId}`
      );
    } catch {}

    const updatedOpp = (await this.getBiddingOpportunityById(opportunityId)) || {
      ...opp,
      current_highest_bid: amountPerTonne,
      bid_count: opp.bid_count + 1,
    };

    const newBid: Bid = {
      id: bidId,
      bidding_opportunity_id: opportunityId,
      bidder_id: bidder.id,
      bidder_name: bidder.name,
      bidder_company: bidder.company,
      amount_per_tonne: amountPerTonne,
      quantity,
      total_amount: totalAmount,
      status: 'WINNING',
      created_at: timestamp,
      updated_at: timestamp,
      opportunity: updatedOpp,
    };

    this.memoryBids.unshift(newBid);

    return { bid: newBid, opportunity: updatedOpp };
  }

  async getBuyerBids(buyerId: string): Promise<Bid[]> {
    let dbBids: Bid[] = [];
    try {
      const rows = await query(`SELECT * FROM bids WHERE bidder_id = $1 ORDER BY created_at DESC`, [buyerId]);
      const opps = await this.getBiddingOpportunities();
      dbBids = rows.map((b) => ({
        ...b,
        amount_per_tonne: Number(b.amount_per_tonne),
        quantity: Number(b.quantity),
        total_amount: Number(b.total_amount),
        opportunity: opps.find((o) => o.id === b.bidding_opportunity_id),
      }));
    } catch {}

    const bidMap = new Map<string, Bid>();
    for (const memBid of this.memoryBids) {
      if (memBid.bidder_id === buyerId) {
        bidMap.set(memBid.id, memBid);
      }
    }
    for (const dbBid of dbBids) {
      bidMap.set(dbBid.id, dbBid);
    }
    return Array.from(bidMap.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  async getBidsForOpportunity(opportunityId: string): Promise<Bid[]> {
    let dbBids: Bid[] = [];
    try {
      const rows = await query(`SELECT * FROM bids WHERE bidding_opportunity_id = $1 ORDER BY amount_per_tonne DESC, created_at ASC`, [opportunityId]);
      dbBids = rows.map((b) => ({
        ...b,
        amount_per_tonne: Number(b.amount_per_tonne),
        quantity: Number(b.quantity),
        total_amount: Number(b.total_amount),
      }));
    } catch {}

    const bidMap = new Map<string, Bid>();
    for (const memBid of this.memoryBids) {
      if (memBid.bidding_opportunity_id === opportunityId) {
        bidMap.set(memBid.id, memBid);
      }
    }
    for (const dbBid of dbBids) {
      bidMap.set(dbBid.id, dbBid);
    }
    return Array.from(bidMap.values()).sort((a, b) => b.amount_per_tonne - a.amount_per_tonne);
  }

  async createProposalFromWinningBid(
    opportunityId: string,
    bidId: string,
    dealer: UserProfile
  ): Promise<FacilitatedDeal> {
    const opp = await this.getBiddingOpportunityById(opportunityId);
    if (!opp) throw new Error('Opportunity not found');

    const bid = await queryOne<Bid>(`SELECT * FROM bids WHERE id = $1`, [bidId]);
    if (!bid) throw new Error('Winning bid not found');

    const source = await this.getSourceById(opp.carbon_source_id);
    const carbonVal = bid.quantity * bid.amount_per_tonne * 3;
    const logEst = generateLogisticsEstimate(source ? source.location : 'Mumbai, MH', 'Pune, MH', bid.quantity);

    const dealId = `deal-cx-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    const deal: FacilitatedDeal = {
      id: dealId,
      dealer_id: dealer.id,
      dealer_name: dealer.company || dealer.name,
      buyer_id: bid.bidder_id,
      buyer_name: bid.bidder_company || bid.bidder_name,
      carbon_source_id: opp.carbon_source_id,
      carbon_source_name: source ? source.company_name : 'Mumbai Steel Works',
      bidding_opportunity_id: opp.id,
      bid_id: bid.id,
      quantity: bid.quantity,
      price_per_tonne: bid.amount_per_tonne,
      total_carbon_value: carbonVal,
      logistics_cost: logEst.estimatedCost,
      total_value: carbonVal + logEst.estimatedCost,
      match_score: 98,
      commission: Math.round(carbonVal * 0.05),
      status: 'PROPOSED',
      created_at: now,
      updated_at: now,
    };

    await query(
      `INSERT INTO facilitated_deals (id, dealer_id, dealer_name, buyer_id, buyer_name, carbon_source_id, carbon_source_name, bidding_opportunity_id, bid_id, quantity, price_per_tonne, total_carbon_value, logistics_cost, total_value, match_score, commission, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)`,
      [
        deal.id,
        deal.dealer_id,
        deal.dealer_name,
        deal.buyer_id,
        deal.buyer_name,
        deal.carbon_source_id,
        deal.carbon_source_name,
        deal.bidding_opportunity_id,
        deal.bid_id,
        deal.quantity,
        deal.price_per_tonne,
        deal.total_carbon_value,
        deal.logistics_cost,
        deal.total_value,
        deal.match_score,
        deal.commission,
        deal.status,
        now,
        now,
      ]
    );

    // Update bidding opportunity status to AWARDED
    await query(`UPDATE bidding_opportunities SET status = 'AWARDED', updated_at = $1 WHERE id = $2`, [now, opportunityId]);

    // Notify Buyer
    await this.createNotification({
      user_id: bid.bidder_id,
      role_target: 'BUYER',
      title: 'Commercial Proposal Generated for Your Winning Bid!',
      message: `${dealer.company} issued proposal ${deal.id} based on your winning bid of ₹${bid.amount_per_tonne}/t.`,
      link: '/buyer/proposals',
    });

    await this.logAudit(dealer.id, dealer.name, 'DEALER', 'CREATE_PROPOSAL_FROM_BID', `Created proposal for deal ${dealId} from bid ${bidId}`);

    return deal;
  }

  // --- BUYER REQUIREMENTS ---
  async getRequirements(): Promise<BuyerRequirement[]> {
    try {
      const rows = await query<BuyerRequirement>(`SELECT * FROM buyer_requirements ORDER BY created_at DESC`);
      if (rows) return rows;
      return db.getRequirements();
    } catch {
      return db.getRequirements();
    }
  }

  async getBuyerRequirements(buyerId: string): Promise<BuyerRequirement[]> {
    try {
      const rows = await query<BuyerRequirement>(
        `SELECT * FROM buyer_requirements WHERE buyer_id = $1 ORDER BY created_at DESC`,
        [buyerId]
      );
      if (rows) return rows;
      return [];
    } catch (err: any) {
      console.warn('[server-db] PostgreSQL query failed for getBuyerRequirements:', err?.message || err);
      const all = await db.getRequirements();
      return all.filter((r) => r.buyer_id === buyerId);
    }
  }

  async getRequirementById(id: string): Promise<BuyerRequirement | undefined> {
    try {
      const row = await queryOne<BuyerRequirement>(`SELECT * FROM buyer_requirements WHERE id = $1`, [id]);
      if (row) return row;
      return db.getRequirementById(id);
    } catch {
      return db.getRequirementById(id);
    }
  }

  async createRequirement(
    reqData: Omit<BuyerRequirement, 'id' | 'created_at'>
  ): Promise<BuyerRequirement> {
    const id = `req-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const newReq: BuyerRequirement = {
      ...reqData,
      id,
      created_at: now,
    };

    // Always maintain memory cache in sync
    await db.addRequirement(newReq);

    try {
      await query(
        `INSERT INTO buyer_requirements (id, buyer_id, buyer_name, title, application, required_quantity, required_purity, location, latitude, longitude, max_distance, max_price, frequency, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
        [
          id,
          reqData.buyer_id,
          reqData.buyer_name,
          reqData.title,
          reqData.application,
          reqData.required_quantity,
          reqData.required_purity,
          reqData.location,
          reqData.latitude || 19.0760,
          reqData.longitude || 72.8777,
          reqData.max_distance || 500,
          reqData.max_price || 6000,
          reqData.frequency || 'Monthly Spot Agreement',
          reqData.status || 'ACTIVE',
          now,
        ]
      );
    } catch (err: any) {
      console.warn('[server-db] PostgreSQL insertion failed for createRequirement:', err?.message || err);
    }

    try {
      await this.logAudit(
        reqData.buyer_id,
        reqData.buyer_name,
        'BUYER',
        'CREATE_REQUIREMENT',
        `Created CO2 requirement: ${reqData.required_quantity} t/mo (${reqData.application})`
      );
    } catch {}

    try {
      await this.createNotification({
        user_id: 'user-dealer-demo',
        role_target: 'DEALER',
        title: 'New Buyer Requirement Posted',
        message: `${reqData.buyer_name} requested ${reqData.required_quantity} t/mo for ${reqData.application}.`,
        link: '/dealer/dashboard',
      });
    } catch {}

    return newReq;
  }

  // --- MATCHES ---
  async getMatches(): Promise<MatchRecord[]> {
    const sources = await this.getSources();
    const requirements = await this.getRequirements();

    const matches: MatchRecord[] = [];
    requirements.forEach((req) => {
      sources.forEach((src) => {
        const breakdown = calculateMatch(src, req);
        matches.push({
          id: `match-${src.id}-${req.id}`,
          carbon_source_id: src.id,
          requirement_id: req.id,
          ...breakdown,
          created_at: req.created_at,
          source: src,
          requirement: req,
          listing: src,
        });
      });
    });
    return matches;
  }

  // --- DEALS ---
  async getDeals(): Promise<FacilitatedDeal[]> {
    try {
      const rows = await query(`SELECT * FROM facilitated_deals ORDER BY created_at DESC`);
      const sources = await this.getSources();
      const requirements = await this.getRequirements();

      return rows.map((d) => ({
        ...d,
        source: sources.find((s) => s.id === d.carbon_source_id),
        requirement: requirements.find((r) => r.id === d.requirement_id),
      }));
    } catch {
      return [];
    }
  }

  async getDealById(id: string): Promise<FacilitatedDeal | undefined> {
    const deals = await this.getDeals();
    return deals.find((d) => d.id === id);
  }

  async createBuyerRequest(requestData: {
    buyer_id: string;
    buyer_name: string;
    carbon_source_id: string;
    requirement_id?: string;
    quantity: number;
  }): Promise<{ deal: FacilitatedDeal; shipment: LogisticsShipment }> {
    const src = await this.getSourceById(requestData.carbon_source_id);
    const price = src ? src.price_per_tonne : 4200;
    const carbonVal = requestData.quantity * price * 3;
    const logEst = generateLogisticsEstimate(src ? src.location : 'Mumbai, MH', 'Pune, MH', requestData.quantity);

    const dealId = `deal-cx-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    const newDeal: FacilitatedDeal = {
      id: dealId,
      dealer_id: 'user-dealer-demo',
      dealer_name: 'CarbonBridge Trading',
      buyer_id: requestData.buyer_id,
      buyer_name: requestData.buyer_name,
      carbon_source_id: requestData.carbon_source_id,
      carbon_source_name: src ? src.company_name : 'Mumbai Steel Works',
      requirement_id: requestData.requirement_id,
      quantity: requestData.quantity,
      price_per_tonne: price,
      total_carbon_value: carbonVal,
      logistics_cost: logEst.estimatedCost,
      total_value: carbonVal + logEst.estimatedCost,
      match_score: 94,
      commission: Math.round(carbonVal * 0.05),
      status: 'PROPOSED',
      created_at: now,
      updated_at: now,
    };

    try {
      await query(
        `INSERT INTO facilitated_deals (id, dealer_id, dealer_name, buyer_id, buyer_name, carbon_source_id, carbon_source_name, requirement_id, quantity, price_per_tonne, total_carbon_value, logistics_cost, total_value, match_score, commission, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)`,
        [
          newDeal.id,
          newDeal.dealer_id,
          newDeal.dealer_name,
          newDeal.buyer_id,
          newDeal.buyer_name,
          newDeal.carbon_source_id,
          newDeal.carbon_source_name,
          newDeal.requirement_id || null,
          newDeal.quantity,
          newDeal.price_per_tonne,
          newDeal.total_carbon_value,
          newDeal.logistics_cost,
          newDeal.total_value,
          newDeal.match_score,
          newDeal.commission,
          newDeal.status,
          now,
          now,
        ]
      );
    } catch (err: any) {
      console.warn('[server-db] PostgreSQL insertion failed for createBuyerRequest (facilitated_deals), using memory fallback:', err?.message || err);
      db.addDeal(newDeal);
    }

    const shipmentId = `shipment-cx-${Math.floor(2000 + Math.random() * 8000)}`;
    const newShipment: LogisticsShipment = {
      id: shipmentId,
      deal_id: dealId,
      origin: logEst.origin,
      destination: logEst.destination,
      distance_km: logEst.distanceKm,
      quantity: requestData.quantity,
      transport_mode: logEst.transportMode,
      vehicle_type: '28-Tonne Cryogenic Semi-Trailer',
      driver_name: 'Unassigned',
      estimated_cost: logEst.estimatedCost,
      cost_per_tonne: logEst.costPerTonne,
      estimated_delivery_days: logEst.estimatedDeliveryDays,
      status: 'AWAITING_LOGISTICS',
      tracking_code: `CX-MH-${Math.floor(10000 + Math.random() * 90000)}`,
      tracking_notes: ['Shipment created and awaiting logistics provider acceptance.'],
      created_at: now,
      updated_at: now,
    };

    try {
      await query(
        `INSERT INTO logistics_shipments (id, deal_id, origin, destination, distance_km, quantity, transport_mode, vehicle_type, driver_name, estimated_cost, cost_per_tonne, estimated_delivery_days, status, tracking_code, tracking_notes, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
        [
          newShipment.id,
          newShipment.deal_id,
          newShipment.origin,
          newShipment.destination,
          newShipment.distance_km,
          newShipment.quantity,
          newShipment.transport_mode,
          newShipment.vehicle_type,
          newShipment.driver_name,
          newShipment.estimated_cost,
          newShipment.cost_per_tonne,
          newShipment.estimated_delivery_days,
          newShipment.status,
          newShipment.tracking_code,
          JSON.stringify(newShipment.tracking_notes),
          now,
          now,
        ]
      );
    } catch (err: any) {
      console.warn('[server-db] PostgreSQL insertion failed for createBuyerRequest (logistics_shipments), using memory fallback:', err?.message || err);
      db.addShipment(newShipment);
    }

    // Always register in memory store for fallback read availability
    await db.addDeal(newDeal);
    await db.addShipment(newShipment);

    try {
      await this.logAudit(
        requestData.buyer_id,
        requestData.buyer_name,
        'BUYER',
        'SUBMIT_REQUEST',
        `Submitted purchase request for ${requestData.quantity} t CO2`
      );
    } catch {}

    try {
      await this.createNotification({
        user_id: 'user-dealer-demo',
        role_target: 'DEALER',
        title: 'New High-Value Opportunity',
        message: `${requestData.buyer_name} requested ${requestData.quantity} t/mo from ${newDeal.carbon_source_name}.`,
        link: '/dealer/dashboard',
      });
    } catch {}

    return { deal: newDeal, shipment: newShipment };

    return { deal: newDeal, shipment: newShipment };
  }

  async createDealerProposal(proposalData: {
    dealer_id: string;
    dealer_name: string;
    buyer_id: string;
    buyer_name: string;
    carbon_source_id: string;
    carbon_source_name: string;
    quantity: number;
    price_per_tonne: number;
  }): Promise<FacilitatedDeal> {
    const carbonVal = proposalData.quantity * proposalData.price_per_tonne * 3;
    const logEst = generateLogisticsEstimate('Mumbai, MH', 'Pune, MH', proposalData.quantity);
    const dealId = `deal-cx-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    const deal: FacilitatedDeal = {
      id: dealId,
      dealer_id: proposalData.dealer_id,
      dealer_name: proposalData.dealer_name,
      buyer_id: proposalData.buyer_id,
      buyer_name: proposalData.buyer_name,
      carbon_source_id: proposalData.carbon_source_id,
      carbon_source_name: proposalData.carbon_source_name,
      quantity: proposalData.quantity,
      price_per_tonne: proposalData.price_per_tonne,
      total_carbon_value: carbonVal,
      logistics_cost: logEst.estimatedCost,
      total_value: carbonVal + logEst.estimatedCost,
      match_score: 94,
      commission: Math.round(carbonVal * 0.05),
      status: 'PROPOSED',
      created_at: now,
      updated_at: now,
    };

    try {
      await query(
        `INSERT INTO facilitated_deals (id, dealer_id, dealer_name, buyer_id, buyer_name, carbon_source_id, carbon_source_name, quantity, price_per_tonne, total_carbon_value, logistics_cost, total_value, match_score, commission, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
        [
          deal.id,
          deal.dealer_id,
          deal.dealer_name,
          deal.buyer_id,
          deal.buyer_name,
          deal.carbon_source_id,
          deal.carbon_source_name,
          deal.quantity,
          deal.price_per_tonne,
          deal.total_carbon_value,
          deal.logistics_cost,
          deal.total_value,
          deal.match_score,
          deal.commission,
          deal.status,
          now,
          now,
        ]
      );
    } catch (err: any) {
      console.warn('[server-db] PostgreSQL insertion failed for createDealerProposal (fallback active):', err?.message || err);
    }

    try {
      await this.logAudit(proposalData.dealer_id, proposalData.dealer_name, 'DEALER', 'CREATE_PROPOSAL', `Created deal proposal ${deal.id}`);
    } catch {}

    try {
      await this.createNotification({
        user_id: proposalData.buyer_id,
        role_target: 'BUYER',
        title: 'Dealer Proposal Received',
        message: `${proposalData.dealer_name} proposed ${proposalData.quantity} t/mo agreement with ${proposalData.carbon_source_name}.`,
        link: '/buyer/dashboard',
      });
    } catch {}

    return deal;
  }

  async acceptProposal(dealId: string, buyerUserId: string): Promise<{ deal: FacilitatedDeal; shipment?: LogisticsShipment }> {
    const now = new Date().toISOString();
    await query(`UPDATE facilitated_deals SET status = 'CONFIRMED', updated_at = $1 WHERE id = $2`, [now, dealId]);
    const updatedDeal = await this.getDealById(dealId);
    if (!updatedDeal) throw new Error('Deal not found');

    // Update corresponding bid to ACCEPTED if bid exists
    if (updatedDeal.bid_id) {
      await query(`UPDATE bids SET status = 'ACCEPTED', updated_at = $1 WHERE id = $2`, [now, updatedDeal.bid_id]);
    }

    const shipments = await this.getShipments();
    let shipment = shipments.find((s) => s.deal_id === dealId);

    if (shipment) {
      const notes = [...shipment.tracking_notes, 'Buyer accepted proposal. Shipment awaiting logistics provider acceptance.'];
      await query(
        `UPDATE logistics_shipments SET status = 'AWAITING_LOGISTICS', tracking_notes = $1, updated_at = $2 WHERE id = $3`,
        [JSON.stringify(notes), now, shipment.id]
      );
      shipment.status = 'AWAITING_LOGISTICS';
    } else {
      const logEst = generateLogisticsEstimate('Mumbai, MH', 'Pune, MH', updatedDeal.quantity);
      shipment = {
        id: `shipment-cx-${Math.floor(2000 + Math.random() * 8000)}`,
        deal_id: dealId,
        origin: logEst.origin,
        destination: logEst.destination,
        distance_km: logEst.distanceKm,
        quantity: updatedDeal.quantity,
        transport_mode: logEst.transportMode,
        vehicle_type: '28-Tonne Cryogenic Semi-Trailer',
        driver_name: 'Unassigned',
        estimated_cost: logEst.estimatedCost,
        cost_per_tonne: logEst.costPerTonne,
        estimated_delivery_days: logEst.estimatedDeliveryDays,
        status: 'AWAITING_LOGISTICS',
        tracking_code: `CX-MH-${Math.floor(10000 + Math.random() * 90000)}`,
        tracking_notes: ['Proposal confirmed. Available for logistics providers.'],
        created_at: now,
        updated_at: now,
      };

      await query(
        `INSERT INTO logistics_shipments (id, deal_id, origin, destination, distance_km, quantity, transport_mode, vehicle_type, driver_name, estimated_cost, cost_per_tonne, estimated_delivery_days, status, tracking_code, tracking_notes, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
        [
          shipment.id,
          shipment.deal_id,
          shipment.origin,
          shipment.destination,
          shipment.distance_km,
          shipment.quantity,
          shipment.transport_mode,
          shipment.vehicle_type,
          shipment.driver_name,
          shipment.estimated_cost,
          shipment.cost_per_tonne,
          shipment.estimated_delivery_days,
          shipment.status,
          shipment.tracking_code,
          JSON.stringify(shipment.tracking_notes),
          now,
          now,
        ]
      );
    }

    await this.logAudit(buyerUserId, updatedDeal.buyer_name, 'BUYER', 'ACCEPT_PROPOSAL', `Confirmed deal ${dealId}`);

    await this.createNotification({
      user_id: 'user-logistics-demo',
      role_target: 'LOGISTICS',
      title: 'New Shipment Opportunity Available',
      message: `Shipment ${shipment.tracking_code} (${updatedDeal.quantity}t CO2) is ready for assignment.`,
      link: '/logistics/dashboard',
    });

    return { deal: updatedDeal, shipment };
  }

  // --- SHIPMENTS ---
  async getShipments(): Promise<LogisticsShipment[]> {
    try {
      const rows = await query(`SELECT * FROM logistics_shipments ORDER BY created_at DESC`);
      if (rows && rows.length > 0) {
        const deals = await this.getDeals();
        return rows.map((s) => ({
          ...s,
          tracking_notes: Array.isArray(s.tracking_notes)
            ? s.tracking_notes
            : typeof s.tracking_notes === 'string'
            ? JSON.parse(s.tracking_notes)
            : [],
          deal: deals.find((d) => d.id === s.deal_id),
        }));
      }
      return db.getShipments();
    } catch {
      return db.getShipments();
    }
  }

  async getShipmentById(id: string): Promise<LogisticsShipment | undefined> {
    const shipments = await this.getShipments();
    const found = shipments.find((s) => s.id === id);
    if (found) return found;
    return db.getShipmentById(id);
  }

  async acceptShipment(
    shipmentId: string,
    logisticsUserId: string,
    logisticsName: string,
    vehicleType?: string,
    driverName?: string
  ): Promise<LogisticsShipment> {
    const shipment = await this.getShipmentById(shipmentId);
    if (!shipment) throw new Error('Shipment not found');

    const now = new Date().toISOString();
    const updatedNotes = [
      ...shipment.tracking_notes,
      `Accepted by ${logisticsName}. Assigned driver: ${driverName || 'Driver Ramesh'}.`,
    ];

    try {
      await query(
        `UPDATE logistics_shipments
         SET logistics_provider_id = $1, logistics_provider_name = $2, vehicle_type = COALESCE($3, vehicle_type), driver_name = COALESCE($4, driver_name), status = 'PREPARING', tracking_notes = $5, updated_at = $6
         WHERE id = $7`,
        [logisticsUserId, logisticsName, vehicleType || null, driverName || null, JSON.stringify(updatedNotes), now, shipmentId]
      );
    } catch (err: any) {
      console.warn('[server-db] PostgreSQL update failed for acceptShipment, using memory fallback:', err?.message || err);
      return db.acceptShipment(shipmentId, logisticsUserId, logisticsName, vehicleType, driverName);
    }

    try {
      await this.logAudit(logisticsUserId, logisticsName, 'LOGISTICS', 'ACCEPT_SHIPMENT', `Accepted shipment ${shipmentId}`);
    } catch {}

    const updated = await this.getShipmentById(shipmentId);
    return updated || db.acceptShipment(shipmentId, logisticsUserId, logisticsName, vehicleType, driverName);
  }

  async updateShipmentStatus(
    shipmentId: string,
    newStatus: ShipmentStatus,
    note?: string,
    userId?: string
  ): Promise<LogisticsShipment> {
    const shipment = await this.getShipmentById(shipmentId);
    if (!shipment) throw new Error('Shipment not found');

    const now = new Date().toISOString();
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const autoNote = note || `Status updated to ${newStatus.replace('_', ' ')} at ${timestamp}`;
    const updatedNotes = [...shipment.tracking_notes, autoNote];

    await query(
      `UPDATE logistics_shipments SET status = $1, tracking_notes = $2, updated_at = $3 WHERE id = $4`,
      [newStatus, JSON.stringify(updatedNotes), now, shipmentId]
    );

    if (newStatus === 'DELIVERED') {
      await query(`UPDATE facilitated_deals SET status = 'COMPLETED', updated_at = $1 WHERE id = $2`, [now, shipment.deal_id]);
    }

    const updated = await this.getShipmentById(shipmentId);
    await this.logAudit(
      userId || 'user-logistics-demo',
      updated?.logistics_provider_name || 'EcoTransit Logistics',
      'LOGISTICS',
      'UPDATE_SHIPMENT_STATUS',
      `Updated shipment ${updated?.tracking_code} to ${newStatus}`
    );

    return updated!;
  }

  async updateTransportDetails(
    shipmentId: string,
    details: {
      vehicle_type?: string;
      driver_name?: string;
      driver_phone?: string;
      pickup_date?: string;
      estimated_delivery?: string;
    }
  ): Promise<LogisticsShipment> {
    const now = new Date().toISOString();
    await query(
      `UPDATE logistics_shipments
       SET vehicle_type = COALESCE($1, vehicle_type), driver_name = COALESCE($2, driver_name), pickup_date = COALESCE($3, pickup_date), estimated_delivery = COALESCE($4, estimated_delivery), updated_at = $5
       WHERE id = $6`,
      [details.vehicle_type || null, details.driver_name || null, details.pickup_date || null, details.estimated_delivery || null, now, shipmentId]
    );

    const updated = await this.getShipmentById(shipmentId);
    return updated!;
  }

  // --- NOTIFICATIONS & AUDIT ---
  // --- NOTIFICATIONS & AUDIT ---
  async getNotifications(userId?: string, role?: UserRole): Promise<AppNotification[]> {
    try {
      let rows = await query<AppNotification>(`SELECT * FROM app_notifications ORDER BY created_at DESC`);
      
      let filtered = rows.filter((n) => {
        if (userId && n.user_id === userId) return true;
        if (role && (n.role_target === role || n.role_target === 'ALL')) return true;
        return false;
      });

      // If no notifications exist for this user/role, seed default notifications into DB
      if (filtered.length === 0 && (userId || role)) {
        await this.seedDefaultNotifications(userId || 'demo-user', role || 'DEALER');
        rows = await query<AppNotification>(`SELECT * FROM app_notifications ORDER BY created_at DESC`);
        filtered = rows.filter((n) => {
          if (userId && n.user_id === userId) return true;
          if (role && (n.role_target === role || n.role_target === 'ALL')) return true;
          return false;
        });
      }

      return filtered;
    } catch (err) {
      console.error('Error fetching notifications:', err);
      return [];
    }
  }

  async seedDefaultNotifications(userId: string, role: UserRole) {
    const now = Date.now();
    const items: Omit<AppNotification, 'id'>[] = [];

    if (role === 'DEALER') {
      items.push(
        {
          user_id: userId,
          role_target: 'DEALER',
          title: 'New buyer demand match',
          message: 'GreenFuel Technologies requested 500t/mo CO₂ supply (94% match).',
          link: '/dealer/demand',
          read: false,
          created_at: new Date(now - 5 * 60 * 1000).toISOString(),
        },
        {
          user_id: userId,
          role_target: 'DEALER',
          title: 'Proposal viewed by buyer',
          message: 'GreenFuel Technologies viewed your proposal #PROP-8821.',
          link: '/dealer/proposals',
          read: false,
          created_at: new Date(now - 45 * 60 * 1000).toISOString(),
        },
        {
          user_id: userId,
          role_target: 'DEALER',
          title: 'Auction status update',
          message: 'Spot 500t CO₂ auction received 4 competitive bids.',
          link: '/dealer/opportunities',
          read: false,
          created_at: new Date(now - 3 * 3600 * 1000).toISOString(),
        },
        {
          user_id: userId,
          role_target: 'DEALER',
          title: 'Proposal accepted',
          message: 'CleanGas Pvt Ltd accepted your commercial terms. Commission: ₹63,000.',
          link: '/dealer/pipeline',
          read: true,
          created_at: new Date(now - 24 * 3600 * 1000).toISOString(),
        },
        {
          user_id: userId,
          role_target: 'DEALER',
          title: 'Shipment dispatched',
          message: 'Shipment #CX-2048 is in transit to buyer facility.',
          link: '/dealer/shipments',
          read: true,
          created_at: new Date(now - 48 * 3600 * 1000).toISOString(),
        }
      );
    } else if (role === 'BUYER') {
      items.push(
        {
          user_id: userId,
          role_target: 'BUYER',
          title: 'New supply listing available',
          message: 'Mumbai Steel Works posted 450t high-purity CO₂ supply.',
          link: '/buyer/marketplace',
          read: false,
          created_at: new Date(now - 10 * 60 * 1000).toISOString(),
        },
        {
          user_id: userId,
          role_target: 'BUYER',
          title: 'Dealer proposal received',
          message: 'CarbonBridge Brokers submitted proposal for 300 t/mo agreement.',
          link: '/buyer/proposals',
          read: false,
          created_at: new Date(now - 2 * 3600 * 1000).toISOString(),
        }
      );
    } else {
      items.push(
        {
          user_id: userId,
          role_target: 'LOGISTICS',
          title: 'New shipment contract available',
          message: 'Route Mumbai → Pune (300t CO₂) ready for assignment.',
          link: '/logistics/routes',
          read: false,
          created_at: new Date(now - 15 * 60 * 1000).toISOString(),
        }
      );
    }

    for (const item of items) {
      const id = `notif-${Math.random().toString(36).substring(2, 9)}`;
      await query(
        `INSERT INTO app_notifications (id, user_id, role_target, title, message, link, read, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO NOTHING`,
        [id, item.user_id, item.role_target, item.title, item.message, item.link || null, item.read, item.created_at]
      );
    }
  }

  async markNotificationAsRead(id: string) {
    await query(`UPDATE app_notifications SET read = TRUE WHERE id = $1`, [id]);
  }

  async markAllNotificationsAsRead(userId?: string, role?: UserRole) {
    if (userId && role) {
      await query(
        `UPDATE app_notifications SET read = TRUE WHERE user_id = $1 OR role_target = $2 OR role_target = 'ALL'`,
        [userId, role]
      );
    } else if (userId) {
      await query(`UPDATE app_notifications SET read = TRUE WHERE user_id = $1`, [userId]);
    } else {
      await query(`UPDATE app_notifications SET read = TRUE`);
    }
  }

  async createNotification(data: Omit<AppNotification, 'id' | 'read' | 'created_at'>) {
    const id = `notif-${Date.now()}`;
    const now = new Date().toISOString();
    await query(
      `INSERT INTO app_notifications (id, user_id, role_target, title, message, link, read, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [id, data.user_id, data.role_target || 'ALL', data.title, data.message, data.link || null, false, now]
    );
  }

  async getAuditLogs(): Promise<AuditLog[]> {
    try {
      return await query(`SELECT * FROM audit_logs ORDER BY timestamp DESC`);
    } catch {
      return [];
    }
  }

  async logAudit(userId: string, userName: string, role: UserRole, action: string, resource: string) {
    const id = `audit-${Date.now()}`;
    const now = new Date().toISOString();
    await query(
      `INSERT INTO audit_logs (id, user_id, user_name, role, action, resource, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id, userId, userName, role, action, resource, now]
    );
  }

  // --- ANALYTICS METRICS ---
  async getAnalytics(): Promise<AnalyticsSummary> {
    const sources = await this.getSources();
    const requirements = await this.getRequirements();
    const deals = await this.getDeals();
    const shipments = await this.getShipments();

    const co2Available = sources.reduce((sum, s) => sum + s.available_quantity, 0);
    const co2Required = requirements.reduce((sum, r) => sum + r.required_quantity, 0);
    const co2Utilized = deals.reduce((sum, d) => sum + d.quantity, 0) + 8920;

    const totalFacilitatedVal = deals.reduce((sum, d) => sum + d.total_value, 0) + 4800000;
    const totalCommissionVal = deals.reduce((sum, d) => sum + d.commission, 0) + 720000;
    const totalLogisticsVal = shipments.reduce((sum, s) => sum + s.estimated_cost, 0) + 680000;

    return {
      co2AvailableTotal: co2Available,
      co2RequiredTotal: co2Required,
      co2UtilizedTotal: co2Utilized,
      activeSuppliersCount: 38,
      activeBuyersCount: 24,
      activeMatchesCount: (await this.getMatches()).length,
      activeNegotiationsCount: deals.filter((d) => d.status === 'PROPOSED' || d.status === 'NEGOTIATING').length + 12,
      facilitatedDealValueTotal: totalFacilitatedVal,
      potentialCommissionTotal: totalCommissionVal,
      availableShipmentsCount: shipments.filter((s) => s.status === 'AWAITING_LOGISTICS').length + 12,
      activeShipmentsCount: shipments.filter((s) => s.status === 'PREPARING' || s.status === 'PICKED_UP' || s.status === 'IN_TRANSIT').length,
      inTransitShipmentsCount: shipments.filter((s) => s.status === 'IN_TRANSIT').length + 5,
      deliveredThisMonthCount: shipments.filter((s) => s.status === 'DELIVERED').length + 24,
      totalLogisticsValue: totalLogisticsVal,
    };
  }
}

export const serverDb = new CarbonXServerDatabase();
