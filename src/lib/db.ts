import {
  UserProfile,
  UserRole,
  CarbonSource,
  BuyerRequirement,
  MatchRecord,
  FacilitatedDeal,
  ProposalStatus,
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

const STORAGE_KEYS = {
  USERS: 'carbonx_users_v2',
  CURRENT_USER: 'carbonx_current_user_v2',
  SOURCES: 'carbonx_sources_v2',
  REQUIREMENTS: 'carbonx_requirements_v2',
  MATCHES: 'carbonx_matches_v2',
  DEALS: 'carbonx_deals_v2',
  SHIPMENTS: 'carbonx_shipments_v2',
  NOTIFICATIONS: 'carbonx_notifications_v2',
  AUDIT_LOGS: 'carbonx_audit_logs_v2',
};

function getStoredItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error(`Error reading ${key} from localStorage`, e);
    return fallback;
  }
}

function setStoredItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error writing ${key} to localStorage`, e);
  }
}

class CarbonXDatabase {
  private users: UserProfile[] = INITIAL_USERS;
  private currentUser: UserProfile = INITIAL_USERS[0]; // Default BUYER
  private sources: CarbonSource[] = INITIAL_SOURCES;
  private requirements: BuyerRequirement[] = INITIAL_REQUIREMENTS;
  private matches: MatchRecord[] = INITIAL_MATCHES;
  private deals: FacilitatedDeal[] = INITIAL_DEALS;
  private shipments: LogisticsShipment[] = INITIAL_SHIPMENTS;
  private notifications: AppNotification[] = INITIAL_NOTIFICATIONS;
  private auditLogs: AuditLog[] = INITIAL_AUDIT_LOGS;

  constructor() {
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  private init() {
    this.users = getStoredItem(STORAGE_KEYS.USERS, INITIAL_USERS);
    this.currentUser = getStoredItem(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[0]);
    this.sources = getStoredItem(STORAGE_KEYS.SOURCES, INITIAL_SOURCES);
    this.requirements = getStoredItem(STORAGE_KEYS.REQUIREMENTS, INITIAL_REQUIREMENTS);
    this.matches = getStoredItem(STORAGE_KEYS.MATCHES, INITIAL_MATCHES);
    this.deals = getStoredItem(STORAGE_KEYS.DEALS, INITIAL_DEALS);
    this.shipments = getStoredItem(STORAGE_KEYS.SHIPMENTS, INITIAL_SHIPMENTS);
    this.notifications = getStoredItem(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    this.auditLogs = getStoredItem(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
  }

  // --- USER & AUTHENTICATION ---
  async getCurrentUser(): Promise<UserProfile> {
    return this.currentUser;
  }

  async setCurrentUserByRole(role: UserRole): Promise<UserProfile> {
    const target = this.users.find((u) => u.role === role) || this.users[0];
    this.currentUser = target;
    setStoredItem(STORAGE_KEYS.CURRENT_USER, target);
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
    setStoredItem(STORAGE_KEYS.USERS, this.users);
    setStoredItem(STORAGE_KEYS.CURRENT_USER, newUser);

    this.logAudit(newUser.id, newUser.name, newUser.role, 'REGISTER_USER', `Joined as ${newUser.role}`);
    return newUser;
  }

  async login(email: string): Promise<UserProfile> {
    const found = this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!found) {
      throw new Error('User account not found');
    }
    this.currentUser = found;
    setStoredItem(STORAGE_KEYS.CURRENT_USER, found);
    return found;
  }

  async getUsers(): Promise<UserProfile[]> {
    return this.users;
  }

  // --- MARKETPLACE SOURCES (Supply Entities) ---
  async getSources(): Promise<CarbonSource[]> {
    return this.sources;
  }

  async getSourceById(id: string): Promise<CarbonSource | undefined> {
    return this.sources.find((s) => s.id === id);
  }

  // Legacy Aliases for Listings
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
    setStoredItem(STORAGE_KEYS.SOURCES, this.sources);
    return newSource;
  }

  // Legacy Requests Aliases
  async createSupplyRequest(data: any) {
    return this.createBuyerRequest(data);
  }

  async getRequests() {
    return this.deals;
  }

  async updateRequestStatus(dealId: string, status: any) {
    const idx = this.deals.findIndex((d) => d.id === dealId);
    if (idx !== -1) {
      this.deals[idx].status = status;
      setStoredItem(STORAGE_KEYS.DEALS, this.deals);
    }
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
    setStoredItem(STORAGE_KEYS.REQUIREMENTS, this.requirements);

    // Auto calculate matches against sources
    this.autoCalculateMatchesForRequirement(newReq);

    this.logAudit(
      reqData.buyer_id,
      reqData.buyer_name,
      'BUYER',
      'CREATE_REQUIREMENT',
      `Created CO2 requirement: ${reqData.required_quantity} t/mo (${reqData.application})`
    );

    // Notify Dealers of new Buyer requirement opportunity
    this.createNotification({
      user_id: 'user-dealer-demo',
      role_target: 'DEALER',
      title: 'New Buyer Requirement Posted',
      message: `${reqData.buyer_name} requested ${reqData.required_quantity} t/mo for ${reqData.application}.`,
      link: '/dashboard/dealer',
    });

    return newReq;
  }

  // --- MATCHES ENGINE ---
  async getMatches(): Promise<MatchRecord[]> {
    return this.matches.map((m) => ({
      ...m,
      source: this.sources.find((s) => s.id === m.carbon_source_id),
      requirement: this.requirements.find((r) => r.id === m.requirement_id),
      listing: this.sources.find((s) => s.id === m.carbon_source_id),
    }));
  }

  async getMatchById(id: string): Promise<MatchRecord | undefined> {
    const match = this.matches.find((m) => m.id === id);
    if (!match) return undefined;
    const source = this.sources.find((s) => s.id === match.carbon_source_id);
    const requirement = this.requirements.find((r) => r.id === match.requirement_id);
    return {
      ...match,
      source,
      requirement,
      listing: source,
    };
  }

  private autoCalculateMatchesForRequirement(req: BuyerRequirement) {
    this.sources.forEach((src) => {
      const breakdown = calculateMatch(src, req);
      const matchRec: MatchRecord = {
        id: `match-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        carbon_source_id: src.id,
        requirement_id: req.id,
        ...breakdown,
        created_at: new Date().toISOString(),
      };
      this.matches.push(matchRec);
    });
    setStoredItem(STORAGE_KEYS.MATCHES, this.matches);
  }

  // --- DEALER PROPOSALS & FACILITATED DEALS ---
  async getDeals(): Promise<FacilitatedDeal[]> {
    return this.deals.map((d) => ({
      ...d,
      source: this.sources.find((s) => s.id === d.carbon_source_id),
      requirement: this.requirements.find((r) => r.id === d.requirement_id),
    }));
  }

  async getDealById(id: string): Promise<FacilitatedDeal | undefined> {
    const d = this.deals.find((item) => item.id === id);
    if (!d) return undefined;
    return {
      ...d,
      source: this.sources.find((s) => s.id === d.carbon_source_id),
      requirement: this.requirements.find((r) => r.id === d.requirement_id),
    };
  }

  /**
   * BUYER submits purchase request / intent -> Creates an IDENTIFIED / PROPOSED Deal
   */
  async createBuyerRequest(requestData: {
    buyer_id: string;
    buyer_name: string;
    carbon_source_id: string;
    requirement_id?: string;
    quantity: number;
  }): Promise<{ deal: FacilitatedDeal; shipment: LogisticsShipment }> {
    const src = this.sources.find((s) => s.id === requestData.carbon_source_id);
    const price = src ? src.price_per_tonne : 4200;
    const carbonVal = requestData.quantity * price * 3; // 3 months agreement

    const logEst = generateLogisticsEstimate(
      src ? src.location : 'Mumbai, MH',
      'Pune, MH',
      requestData.quantity
    );

    const matchRec = this.matches.find(
      (m) => m.carbon_source_id === requestData.carbon_source_id
    );
    const score = matchRec ? matchRec.score : 94;

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
      match_score: score,
      commission: Math.round(carbonVal * 0.05),
      status: 'PROPOSED',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.deals = [newDeal, ...this.deals];
    setStoredItem(STORAGE_KEYS.DEALS, this.deals);

    // Create corresponding Shipment awaiting logistics acceptance
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
    setStoredItem(STORAGE_KEYS.SHIPMENTS, this.shipments);

    this.logAudit(
      requestData.buyer_id,
      requestData.buyer_name,
      'BUYER',
      'SUBMIT_REQUEST',
      `Submitted purchase request for ${requestData.quantity} t CO2`
    );

    // Notify Dealer
    this.createNotification({
      user_id: 'user-dealer-demo',
      role_target: 'DEALER',
      title: 'New High-Value Opportunity',
      message: `${requestData.buyer_name} requested ${requestData.quantity} t/mo from ${newDeal.carbon_source_name}.`,
      link: '/dashboard/dealer',
    });

    return { deal: newDeal, shipment: newShipment };
  }

  /**
   * DEALER creates or updates proposal
   */
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
    setStoredItem(STORAGE_KEYS.DEALS, this.deals);

    this.logAudit(
      proposalData.dealer_id,
      proposalData.dealer_name,
      'DEALER',
      'CREATE_PROPOSAL',
      `Created deal proposal ${deal.id}`
    );

    // Notify Buyer
    this.createNotification({
      user_id: proposalData.buyer_id,
      role_target: 'BUYER',
      title: 'Dealer Proposal Received',
      message: `${proposalData.dealer_name} proposed ${proposalData.quantity} t/mo agreement with ${proposalData.carbon_source_name}.`,
      link: '/dashboard/buyer',
    });

    return deal;
  }

  /**
   * BUYER accepts proposal -> Status becomes CONFIRMED, shipment becomes AWAITING_LOGISTICS
   */
  async acceptProposal(dealId: string, buyerUserId: string): Promise<{ deal: FacilitatedDeal; shipment?: LogisticsShipment }> {
    const idx = this.deals.findIndex((d) => d.id === dealId);
    if (idx === -1) throw new Error('Deal not found');

    this.deals[idx].status = 'CONFIRMED';
    this.deals[idx].updated_at = new Date().toISOString();
    setStoredItem(STORAGE_KEYS.DEALS, this.deals);
    const updatedDeal = this.deals[idx];

    // Find shipment or create one
    let shipment = this.shipments.find((s) => s.deal_id === dealId);
    if (shipment) {
      shipment.status = 'AWAITING_LOGISTICS';
      shipment.updated_at = new Date().toISOString();
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
    setStoredItem(STORAGE_KEYS.SHIPMENTS, this.shipments);

    this.logAudit(buyerUserId, updatedDeal.buyer_name, 'BUYER', 'ACCEPT_PROPOSAL', `Confirmed deal ${dealId}`);

    // Notify Logistics Providers
    this.createNotification({
      user_id: 'user-logistics-demo',
      role_target: 'LOGISTICS_PROVIDER',
      title: 'New Shipment Opportunity Available',
      message: `Shipment ${shipment.tracking_code} (${updatedDeal.quantity}t CO2) is ready for assignment.`,
      link: '/dashboard/logistics',
    });

    // Notify Dealer
    this.createNotification({
      user_id: updatedDeal.dealer_id || 'user-dealer-demo',
      role_target: 'DEALER',
      title: 'Deal Confirmed by Buyer!',
      message: `${updatedDeal.buyer_name} accepted deal proposal ${dealId}!`,
      link: '/dashboard/dealer',
    });

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

  /**
   * LOGISTICS PROVIDER accepts available shipment
   */
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
    this.shipments[idx].updated_at = new Date().toISOString();
    this.shipments[idx].tracking_notes.push(
      `Accepted by ${logisticsName}. Assigned driver: ${driverName || 'Driver Ramesh'}.`
    );

    setStoredItem(STORAGE_KEYS.SHIPMENTS, this.shipments);
    const updated = this.shipments[idx];

    this.logAudit(logisticsUserId, logisticsName, 'LOGISTICS_PROVIDER', 'ACCEPT_SHIPMENT', `Accepted shipment ${shipmentId}`);

    // Notify Buyer
    const deal = this.deals.find((d) => d.id === updated.deal_id);
    if (deal) {
      this.createNotification({
        user_id: deal.buyer_id,
        role_target: 'BUYER',
        title: 'Shipment Assigned to Logistics Provider',
        message: `${logisticsName} accepted transportation job for shipment ${updated.tracking_code}.`,
        link: '/dashboard/buyer',
      });
    }

    return updated;
  }

  /**
   * LOGISTICS PROVIDER updates shipment status (PREPARING -> PICKED_UP -> IN_TRANSIT -> DELIVERED)
   */
  async updateShipmentStatus(
    shipmentId: string,
    newStatus: ShipmentStatus,
    note?: string,
    userId?: string
  ): Promise<LogisticsShipment> {
    const idx = this.shipments.findIndex((s) => s.id === shipmentId);
    if (idx === -1) throw new Error('Shipment not found');

    this.shipments[idx].status = newStatus;
    this.shipments[idx].updated_at = new Date().toISOString();

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const autoNote = note || `Status updated to ${newStatus.replace('_', ' ')} at ${timestamp}`;
    this.shipments[idx].tracking_notes.push(autoNote);

    setStoredItem(STORAGE_KEYS.SHIPMENTS, this.shipments);
    const updated = this.shipments[idx];

    // Synchronize parent Deal status
    const dealIdx = this.deals.findIndex((d) => d.id === updated.deal_id);
    if (dealIdx !== -1) {
      if (newStatus === 'DELIVERED') {
        this.deals[dealIdx].status = 'COMPLETED';
      } else if (newStatus === 'IN_TRANSIT') {
        this.deals[dealIdx].status = 'CONFIRMED';
      }
      this.deals[dealIdx].updated_at = new Date().toISOString();
      setStoredItem(STORAGE_KEYS.DEALS, this.deals);
    }

    this.logAudit(
      userId || 'user-logistics-demo',
      updated.logistics_provider_name || 'EcoTransit Logistics',
      'LOGISTICS_PROVIDER',
      'UPDATE_SHIPMENT_STATUS',
      `Updated shipment ${updated.tracking_code} to ${newStatus}`
    );

    // Notify Buyer
    const deal = this.deals.find((d) => d.id === updated.deal_id);
    if (deal) {
      this.createNotification({
        user_id: deal.buyer_id,
        role_target: 'BUYER',
        title: `Shipment Update: ${newStatus.replace('_', ' ')}`,
        message: `Shipment ${updated.tracking_code} is now ${newStatus.replace('_', ' ')}.`,
        link: '/dashboard/buyer',
      });

      if (newStatus === 'DELIVERED') {
        // Notify Dealer
        this.createNotification({
          user_id: deal.dealer_id || 'user-dealer-demo',
          role_target: 'DEALER',
          title: 'Deal Completed!',
          message: `Shipment for deal ${deal.id} was delivered successfully. Deal completed!`,
          link: '/dashboard/dealer',
        });
      }
    }

    return updated;
  }

  /**
   * LOGISTICS PROVIDER updates transport vehicle/driver details
   */
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
    this.shipments[idx].updated_at = new Date().toISOString();

    setStoredItem(STORAGE_KEYS.SHIPMENTS, this.shipments);
    return this.shipments[idx];
  }

  // --- NOTIFICATIONS ---
  async getNotifications(userId?: string, role?: UserRole): Promise<AppNotification[]> {
    return this.notifications.filter((n) => {
      if (userId && n.user_id === userId) return true;
      if (role && (n.role_target === role || n.role_target === 'ALL')) return true;
      return false;
    });
  }

  private createNotification(data: Omit<AppNotification, 'id' | 'read' | 'created_at'>) {
    const notif: AppNotification = {
      ...data,
      id: `notif-${Date.now()}`,
      read: false,
      created_at: new Date().toISOString(),
    };
    this.notifications = [notif, ...this.notifications];
    setStoredItem(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
  }

  // --- AUDIT LOGS ---
  async getAuditLogs(): Promise<AuditLog[]> {
    return this.auditLogs;
  }

  private logAudit(userId: string, userName: string, role: UserRole, action: string, resource: string) {
    const log: AuditLog = {
      id: `audit-${Date.now()}`,
      user_id: userId,
      user_name: userName,
      role,
      action,
      resource,
      timestamp: new Date().toISOString(),
    };
    this.auditLogs = [log, ...this.auditLogs];
    setStoredItem(STORAGE_KEYS.AUDIT_LOGS, this.auditLogs);
  }

  // --- ANALYTICS METRICS ---
  async getAnalytics(): Promise<AnalyticsSummary> {
    const co2Available = this.sources.reduce((sum, s) => sum + s.available_quantity, 0);
    const co2Required = this.requirements.reduce((sum, r) => sum + r.required_quantity, 0);
    const co2Utilized = this.deals.reduce((sum, d) => sum + d.quantity, 0) + 8920;

    const totalFacilitatedVal = this.deals.reduce((sum, d) => sum + d.total_value, 0) + 4800000;
    const totalCommissionVal = this.deals.reduce((sum, d) => sum + d.commission, 0) + 720000;
    const totalLogisticsVal = this.shipments.reduce((sum, s) => sum + s.estimated_cost, 0) + 680000;

    return {
      co2AvailableTotal: co2Available,
      co2RequiredTotal: co2Required,
      co2UtilizedTotal: co2Utilized,
      activeSuppliersCount: 38,
      activeBuyersCount: 24,
      activeMatchesCount: this.matches.length,
      activeNegotiationsCount: this.deals.filter((d) => d.status === 'PROPOSED' || d.status === 'NEGOTIATING').length + 12,
      facilitatedDealValueTotal: totalFacilitatedVal,
      potentialCommissionTotal: totalCommissionVal,
      availableShipmentsCount: this.shipments.filter((s) => s.status === 'AWAITING_LOGISTICS').length + 12,
      activeShipmentsCount: this.shipments.filter((s) => s.status === 'PREPARING' || s.status === 'PICKED_UP' || s.status === 'IN_TRANSIT').length,
      inTransitShipmentsCount: this.shipments.filter((s) => s.status === 'IN_TRANSIT').length + 5,
      deliveredThisMonthCount: this.shipments.filter((s) => s.status === 'DELIVERED').length + 24,
      totalLogisticsValue: totalLogisticsVal,
    };
  }

  // Reset demo store state
  async resetToSeedData(): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.clear();
      this.init();
    }
  }
}

export const db = new CarbonXDatabase();
