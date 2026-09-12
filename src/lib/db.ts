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
import {
  INITIAL_USERS,
  INITIAL_SOURCES,
  INITIAL_REQUIREMENTS,
  INITIAL_MATCHES,
  INITIAL_DEALS,
  INITIAL_SHIPMENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
} from './seed-data';
import { calculateMatch } from './matching';
import { generateLogisticsEstimate } from './logistics';

class CarbonXDatabase {
  private users: UserProfile[] = INITIAL_USERS;
  private currentUser: UserProfile | null = null;
  private sources: CarbonSource[] = INITIAL_SOURCES;
  private requirements: BuyerRequirement[] = INITIAL_REQUIREMENTS;
  private deals: FacilitatedDeal[] = INITIAL_DEALS;
  private shipments: LogisticsShipment[] = INITIAL_SHIPMENTS;

  async getCurrentUser(): Promise<UserProfile | null> {
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            this.currentUser = data.user;
            return data.user;
          }
        }
      } catch {}
    }
    return this.currentUser || INITIAL_USERS[0];
  }

  async setCurrentUserByRole(role: UserRole): Promise<UserProfile> {
    const target = this.users.find((u) => u.role === role) || this.users[0];
    this.currentUser = target;
    return target;
  }

  async registerUser(userData: Omit<UserProfile, 'id' | 'createdAt'>): Promise<UserProfile> {
    const newUser: UserProfile = {
      ...userData,
      id: `user-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.users = [...this.users, newUser];
    this.currentUser = newUser;
    return newUser;
  }

  async login(email: string): Promise<UserProfile> {
    const found = this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!found) throw new Error('User account not found');
    this.currentUser = found;
    return found;
  }

  async getUsers(): Promise<UserProfile[]> {
    return this.users;
  }

  // --- MARKETPLACE SOURCES ---
  async getSources(): Promise<CarbonSource[]> {
    return this.sources;
  }

  async getSourceById(id: string): Promise<CarbonSource | undefined> {
    return this.sources.find((s) => s.id === id);
  }

  async getListings(): Promise<CarbonSource[]> {
    return this.getSources();
  }

  async getListingById(id: string): Promise<CarbonSource | undefined> {
    return this.getSourceById(id);
  }

  async createListing(data: any): Promise<CarbonSource> {
    const newSource: CarbonSource = {
      id: `src-${Date.now()}`,
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
      availability_date: data.availability_date || new Date().toISOString().split('T')[0],
      verification_status: 'VERIFIED',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.sources = [newSource, ...this.sources];
    return newSource;
  }

  // --- BUYER REQUIREMENTS ---
  async getRequirements(): Promise<BuyerRequirement[]> {
    return this.requirements;
  }

  async getRequirementById(id: string): Promise<BuyerRequirement | undefined> {
    return this.requirements.find((r) => r.id === id);
  }

  async createRequirement(
    reqData: Omit<BuyerRequirement, 'id' | 'created_at'>
  ): Promise<BuyerRequirement> {
    const newReq: BuyerRequirement = {
      ...reqData,
      id: `req-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    this.requirements = [newReq, ...this.requirements];
    return newReq;
  }

  // --- MATCHES ENGINE ---
  async getMatches(): Promise<MatchRecord[]> {
    const matches: MatchRecord[] = [];
    this.requirements.forEach((req) => {
      this.sources.forEach((src) => {
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

  async getMatchById(id: string): Promise<MatchRecord | undefined> {
    const matches = await this.getMatches();
    return matches.find((m) => m.id === id);
  }

  // --- DEALS & PROPOSALS ---
  async getDeals(): Promise<FacilitatedDeal[]> {
    return this.deals.map((d) => ({
      ...d,
      source: this.sources.find((s) => s.id === d.carbon_source_id),
      requirement: this.requirements.find((r) => r.id === d.requirement_id),
    }));
  }

  async getDealById(id: string): Promise<FacilitatedDeal | undefined> {
    const deals = await this.getDeals();
    return deals.find((d) => d.id === id);
  }

  async getRequests(): Promise<FacilitatedDeal[]> {
    return this.getDeals();
  }

  async updateRequestStatus(dealId: string, status: any): Promise<void> {
    const idx = this.deals.findIndex((d) => d.id === dealId);
    if (idx !== -1) this.deals[idx].status = status;
  }

  async createBuyerRequest(requestData: {
    buyer_id: string;
    buyer_name: string;
    carbon_source_id: string;
    requirement_id?: string;
    quantity: number;
  }): Promise<{ deal: FacilitatedDeal; shipment: LogisticsShipment }> {
    const src = this.sources.find((s) => s.id === requestData.carbon_source_id);
    const price = src ? src.price_per_tonne : 4200;
    const carbonVal = requestData.quantity * price * 3;
    const logEst = generateLogisticsEstimate(src ? src.location : 'Mumbai, MH', 'Pune, MH', requestData.quantity);

    const newDeal: FacilitatedDeal = {
      id: `deal-cx-${Math.floor(1000 + Math.random() * 9000)}`,
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
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.deals = [newDeal, ...this.deals];

    const newShipment: LogisticsShipment = {
      id: `shipment-cx-${Math.floor(2000 + Math.random() * 8000)}`,
      deal_id: newDeal.id,
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
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.shipments = [newShipment, ...this.shipments];
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

    const deal: FacilitatedDeal = {
      id: `deal-cx-${Math.floor(1000 + Math.random() * 9000)}`,
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
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.deals = [deal, ...this.deals];
    return deal;
  }

  async acceptProposal(dealId: string, buyerUserId: string): Promise<{ deal: FacilitatedDeal; shipment?: LogisticsShipment }> {
    const idx = this.deals.findIndex((d) => d.id === dealId);
    if (idx === -1) throw new Error('Deal not found');

    this.deals[idx].status = 'CONFIRMED';
    const updatedDeal = this.deals[idx];

    let shipment = this.shipments.find((s) => s.deal_id === dealId);
    if (shipment) {
      shipment.status = 'AWAITING_LOGISTICS';
      shipment.tracking_notes.push('Buyer accepted proposal. Shipment awaiting logistics provider acceptance.');
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
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      this.shipments = [shipment, ...this.shipments];
    }
    return { deal: updatedDeal, shipment };
  }

  // --- LOGISTICS PROVIDER SHIPMENT WORKFLOW ---
  async getShipments(): Promise<LogisticsShipment[]> {
    return this.shipments.map((s) => ({
      ...s,
      deal: this.deals.find((d) => d.id === s.deal_id),
    }));
  }

  async getShipmentById(id: string): Promise<LogisticsShipment | undefined> {
    const s = this.shipments.find((item) => item.id === id);
    if (!s) return undefined;
    return {
      ...s,
      deal: this.deals.find((d) => d.id === s.deal_id),
    };
  }

  async acceptShipment(
    shipmentId: string,
    logisticsUserId: string,
    logisticsName: string,
    vehicleType?: string,
    driverName?: string
  ): Promise<LogisticsShipment> {
    const idx = this.shipments.findIndex((s) => s.id === shipmentId);
    if (idx === -1) throw new Error('Shipment not found');

    this.shipments[idx].logistics_provider_id = logisticsUserId;
    this.shipments[idx].logistics_provider_name = logisticsName;
    if (vehicleType) this.shipments[idx].vehicle_type = vehicleType;
    if (driverName) this.shipments[idx].driver_name = driverName;
    this.shipments[idx].status = 'PREPARING';
    this.shipments[idx].tracking_notes.push(`Accepted by ${logisticsName}. Assigned driver: ${driverName || 'Driver Ramesh'}.`);

    return this.shipments[idx];
  }

  async updateShipmentStatus(
    shipmentId: string,
    newStatus: ShipmentStatus,
    note?: string
  ): Promise<LogisticsShipment> {
    const idx = this.shipments.findIndex((s) => s.id === shipmentId);
    if (idx === -1) throw new Error('Shipment not found');

    this.shipments[idx].status = newStatus;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    this.shipments[idx].tracking_notes.push(note || `Status updated to ${newStatus.replace('_', ' ')} at ${timestamp}`);

    if (newStatus === 'DELIVERED') {
      const dealIdx = this.deals.findIndex((d) => d.id === this.shipments[idx].deal_id);
      if (dealIdx !== -1) this.deals[dealIdx].status = 'COMPLETED';
    }

    return this.shipments[idx];
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
    const idx = this.shipments.findIndex((s) => s.id === shipmentId);
    if (idx === -1) throw new Error('Shipment not found');

    if (details.vehicle_type) this.shipments[idx].vehicle_type = details.vehicle_type;
    if (details.driver_name) this.shipments[idx].driver_name = details.driver_name;
    if (details.pickup_date) this.shipments[idx].pickup_date = details.pickup_date;
    if (details.estimated_delivery) this.shipments[idx].estimated_delivery = details.estimated_delivery;

    return this.shipments[idx];
  }

  // --- NOTIFICATIONS & AUDIT ---
  async getNotifications(userId?: string, role?: UserRole): Promise<AppNotification[]> {
    return INITIAL_NOTIFICATIONS.filter((n) => {
      if (userId && n.user_id === userId) return true;
      if (role && (n.role_target === role || n.role_target === 'ALL')) return true;
      return false;
    });
  }

  async getAuditLogs(): Promise<AuditLog[]> {
    return INITIAL_AUDIT_LOGS;
  }

  async resetToSeedData(): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
  }

  async getAnalytics(): Promise<AnalyticsSummary> {
    const co2Available = this.sources.reduce((sum, s) => sum + s.available_quantity, 0);
    const co2Required = this.requirements.reduce((sum, r) => sum + r.required_quantity, 0);
    const co2Utilized = this.deals.reduce((sum, d) => sum + d.quantity, 0) + 8920;

    return {
      co2AvailableTotal: co2Available,
      co2RequiredTotal: co2Required,
      co2UtilizedTotal: co2Utilized,
      activeSuppliersCount: 38,
      activeBuyersCount: 24,
      activeMatchesCount: (await this.getMatches()).length,
      activeNegotiationsCount: this.deals.filter((d) => d.status === 'PROPOSED' || d.status === 'NEGOTIATING').length + 12,
      facilitatedDealValueTotal: 5800000,
      potentialCommissionTotal: 720000,
      availableShipmentsCount: this.shipments.filter((s) => s.status === 'AWAITING_LOGISTICS').length + 12,
      activeShipmentsCount: this.shipments.filter((s) => s.status === 'PREPARING' || s.status === 'PICKED_UP' || s.status === 'IN_TRANSIT').length,
      inTransitShipmentsCount: this.shipments.filter((s) => s.status === 'IN_TRANSIT').length + 5,
      deliveredThisMonthCount: this.shipments.filter((s) => s.status === 'DELIVERED').length + 24,
      totalLogisticsValue: 680000,
    };
  }
}

export const db = new CarbonXDatabase();
