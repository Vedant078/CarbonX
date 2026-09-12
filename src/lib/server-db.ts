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
} from '@/types';
import { query, queryOne } from './postgres';
import { calculateMatch } from './matching';
import { generateLogisticsEstimate } from './logistics';

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
      return row || undefined;
    } catch {
      return undefined;
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

  // --- BUYER REQUIREMENTS ---
  async getRequirements(): Promise<BuyerRequirement[]> {
    try {
      return await query(`SELECT * FROM buyer_requirements ORDER BY created_at DESC`);
    } catch {
      return [];
    }
  }

  async getRequirementById(id: string): Promise<BuyerRequirement | undefined> {
    try {
      const row = await queryOne(`SELECT * FROM buyer_requirements WHERE id = $1`, [id]);
      return row || undefined;
    } catch {
      return undefined;
    }
  }

  async createRequirement(
    reqData: Omit<BuyerRequirement, 'id' | 'created_at'>
  ): Promise<BuyerRequirement> {
    const id = `req-${Date.now()}`;
    const now = new Date().toISOString();
    const newReq: BuyerRequirement = {
      ...reqData,
      id,
      created_at: now,
    };

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

    await this.logAudit(
      reqData.buyer_id,
      reqData.buyer_name,
      'BUYER',
      'CREATE_REQUIREMENT',
      `Created CO2 requirement: ${reqData.required_quantity} t/mo (${reqData.application})`
    );

    await this.createNotification({
      user_id: 'user-dealer-demo',
      role_target: 'DEALER',
      title: 'New Buyer Requirement Posted',
      message: `${reqData.buyer_name} requested ${reqData.required_quantity} t/mo for ${reqData.application}.`,
      link: '/dealer/dashboard',
    });

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
      dealer_name: 'CarbonBridge Brokers',
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

    await this.logAudit(
      requestData.buyer_id,
      requestData.buyer_name,
      'BUYER',
      'SUBMIT_REQUEST',
      `Submitted purchase request for ${requestData.quantity} t CO2`
    );

    await this.createNotification({
      user_id: 'user-dealer-demo',
      role_target: 'DEALER',
      title: 'New High-Value Opportunity',
      message: `${requestData.buyer_name} requested ${requestData.quantity} t/mo from ${newDeal.carbon_source_name}.`,
      link: '/dealer/dashboard',
    });

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

    await this.logAudit(proposalData.dealer_id, proposalData.dealer_name, 'DEALER', 'CREATE_PROPOSAL', `Created deal proposal ${deal.id}`);

    await this.createNotification({
      user_id: proposalData.buyer_id,
      role_target: 'BUYER',
      title: 'Dealer Proposal Received',
      message: `${proposalData.dealer_name} proposed ${proposalData.quantity} t/mo agreement with ${proposalData.carbon_source_name}.`,
      link: '/buyer/dashboard',
    });

    return deal;
  }

  async acceptProposal(dealId: string, buyerUserId: string): Promise<{ deal: FacilitatedDeal; shipment?: LogisticsShipment }> {
    const now = new Date().toISOString();
    await query(`UPDATE facilitated_deals SET status = 'CONFIRMED', updated_at = $1 WHERE id = $2`, [now, dealId]);
    const updatedDeal = await this.getDealById(dealId);
    if (!updatedDeal) throw new Error('Deal not found');

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
      role_target: 'LOGISTICS_PROVIDER',
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
    } catch {
      return [];
    }
  }

  async getShipmentById(id: string): Promise<LogisticsShipment | undefined> {
    const shipments = await this.getShipments();
    return shipments.find((s) => s.id === id);
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

    await query(
      `UPDATE logistics_shipments
       SET logistics_provider_id = $1, logistics_provider_name = $2, vehicle_type = COALESCE($3, vehicle_type), driver_name = COALESCE($4, driver_name), status = 'PREPARING', tracking_notes = $5, updated_at = $6
       WHERE id = $7`,
      [logisticsUserId, logisticsName, vehicleType || null, driverName || null, JSON.stringify(updatedNotes), now, shipmentId]
    );

    const updated = await this.getShipmentById(shipmentId);
    await this.logAudit(logisticsUserId, logisticsName, 'LOGISTICS_PROVIDER', 'ACCEPT_SHIPMENT', `Accepted shipment ${shipmentId}`);

    return updated!;
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
      'LOGISTICS_PROVIDER',
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
  async getNotifications(userId?: string, role?: UserRole): Promise<AppNotification[]> {
    try {
      const rows = await query(`SELECT * FROM app_notifications ORDER BY created_at DESC`);
      return rows.filter((n) => {
        if (userId && n.user_id === userId) return true;
        if (role && (n.role_target === role || n.role_target === 'ALL')) return true;
        return false;
      });
    } catch {
      return [];
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
