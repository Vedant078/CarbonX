import {
  UserProfile,
  CarbonListing,
  BuyerRequirement,
  MatchRecord,
  SupplyRequest,
  Deal,
  LogisticsShipment,
  AppNotification,
  AnalyticsSummary,
} from '@/types';
import {
  INITIAL_USERS,
  INITIAL_LISTINGS,
  INITIAL_REQUIREMENTS,
  INITIAL_MATCHES,
  INITIAL_REQUESTS,
  INITIAL_DEALS,
  INITIAL_SHIPMENTS,
  INITIAL_NOTIFICATIONS,
} from './seed-data';
import { calculateMatch } from './matching';
import { generateLogisticsEstimate } from './logistics';

const STORAGE_KEYS = {
  USERS: 'carbonx_users',
  CURRENT_USER: 'carbonx_current_user',
  LISTINGS: 'carbonx_listings',
  REQUIREMENTS: 'carbonx_requirements',
  MATCHES: 'carbonx_matches',
  REQUESTS: 'carbonx_requests',
  DEALS: 'carbonx_deals',
  SHIPMENTS: 'carbonx_shipments',
  NOTIFICATIONS: 'carbonx_notifications',
};

// Helper for LocalStorage SSR safety
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
  private currentUser: UserProfile = INITIAL_USERS[0];
  private listings: CarbonListing[] = INITIAL_LISTINGS;
  private requirements: BuyerRequirement[] = INITIAL_REQUIREMENTS;
  private matches: MatchRecord[] = INITIAL_MATCHES;
  private requests: SupplyRequest[] = INITIAL_REQUESTS;
  private deals: Deal[] = INITIAL_DEALS;
  private shipments: LogisticsShipment[] = INITIAL_SHIPMENTS;
  private notifications: AppNotification[] = INITIAL_NOTIFICATIONS;

  constructor() {
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  private init() {
    this.users = getStoredItem(STORAGE_KEYS.USERS, INITIAL_USERS);
    this.currentUser = getStoredItem(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[0]);
    this.listings = getStoredItem(STORAGE_KEYS.LISTINGS, INITIAL_LISTINGS);
    this.requirements = getStoredItem(STORAGE_KEYS.REQUIREMENTS, INITIAL_REQUIREMENTS);
    this.matches = getStoredItem(STORAGE_KEYS.MATCHES, INITIAL_MATCHES);
    this.requests = getStoredItem(STORAGE_KEYS.REQUESTS, INITIAL_REQUESTS);
    this.deals = getStoredItem(STORAGE_KEYS.DEALS, INITIAL_DEALS);
    this.shipments = getStoredItem(STORAGE_KEYS.SHIPMENTS, INITIAL_SHIPMENTS);
    this.notifications = getStoredItem(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  }

  // --- USER / AUTH METHODS ---
  async getCurrentUser(): Promise<UserProfile> {
    return this.currentUser;
  }

  async setCurrentUser(role: 'SUPPLIER' | 'BUYER' | 'ADMIN'): Promise<UserProfile> {
    const target = this.users.find((u) => u.role === role) || this.users[0];
    this.currentUser = target;
    setStoredItem(STORAGE_KEYS.CURRENT_USER, target);
    return target;
  }

  async getUsers(): Promise<UserProfile[]> {
    return this.users;
  }

  // --- LISTINGS METHODS ---
  async getListings(): Promise<CarbonListing[]> {
    return this.listings;
  }

  async getListingById(id: string): Promise<CarbonListing | undefined> {
    return this.listings.find((l) => l.id === id);
  }

  async createListing(
    listingData: Omit<CarbonListing, 'id' | 'created_at' | 'updated_at'>
  ): Promise<CarbonListing> {
    const newListing: CarbonListing = {
      ...listingData,
      id: `listing-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.listings = [newListing, ...this.listings];
    setStoredItem(STORAGE_KEYS.LISTINGS, this.listings);

    // Auto calculate matches against existing buyer requirements
    this.autoCalculateMatchesForListing(newListing);

    return newListing;
  }

  async updateListing(id: string, updates: Partial<CarbonListing>): Promise<CarbonListing> {
    this.listings = this.listings.map((l) =>
      l.id === id ? { ...l, ...updates, updated_at: new Date().toISOString() } : l
    );
    setStoredItem(STORAGE_KEYS.LISTINGS, this.listings);
    const updated = this.listings.find((l) => l.id === id)!;
    return updated;
  }

  // --- REQUIREMENTS METHODS ---
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

    // Auto calculate matches against listings
    this.autoCalculateMatchesForRequirement(newReq);

    return newReq;
  }

  // --- MATCHING METHODS ---
  async getMatches(): Promise<MatchRecord[]> {
    // Enrich matches with listing and requirement objects
    return this.matches.map((m) => ({
      ...m,
      listing: this.listings.find((l) => l.id === m.listing_id),
      requirement: this.requirements.find((r) => r.id === m.requirement_id),
    }));
  }

  async getMatchById(id: string): Promise<MatchRecord | undefined> {
    const match = this.matches.find((m) => m.id === id);
    if (!match) return undefined;
    return {
      ...match,
      listing: this.listings.find((l) => l.id === match.listing_id),
      requirement: this.requirements.find((r) => r.id === match.requirement_id),
    };
  }

  private autoCalculateMatchesForListing(listing: CarbonListing) {
    this.requirements.forEach((req) => {
      const breakdown = calculateMatch(listing, req);
      const matchRec: MatchRecord = {
        id: `match-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        listing_id: listing.id,
        requirement_id: req.id,
        ...breakdown,
        created_at: new Date().toISOString(),
      };
      this.matches.push(matchRec);
    });
    setStoredItem(STORAGE_KEYS.MATCHES, this.matches);
  }

  private autoCalculateMatchesForRequirement(req: BuyerRequirement) {
    this.listings.forEach((listing) => {
      const breakdown = calculateMatch(listing, req);
      const matchRec: MatchRecord = {
        id: `match-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        listing_id: listing.id,
        requirement_id: req.id,
        ...breakdown,
        created_at: new Date().toISOString(),
      };
      this.matches.push(matchRec);
    });
    setStoredItem(STORAGE_KEYS.MATCHES, this.matches);
  }

  // --- SUPPLY REQUESTS METHODS ---
  async getRequests(): Promise<SupplyRequest[]> {
    return this.requests.map((r) => ({
      ...r,
      listing: this.listings.find((l) => l.id === r.listing_id),
    }));
  }

  async getRequestById(id: string): Promise<SupplyRequest | undefined> {
    const req = this.requests.find((r) => r.id === id);
    if (!req) return undefined;
    return {
      ...req,
      listing: this.listings.find((l) => l.id === req.listing_id),
    };
  }

  async createSupplyRequest(requestData: {
    match_id?: string;
    listing_id: string;
    requirement_id?: string;
    buyer_id: string;
    buyer_name: string;
    supplier_id: string;
    supplier_name: string;
    quantity: number;
    start_date: string;
    duration_months: number;
    message?: string;
  }): Promise<SupplyRequest> {
    const listing = this.listings.find((l) => l.id === requestData.listing_id);
    const price = listing ? listing.price_per_tonne : 4500;
    const carbonValue = requestData.quantity * price * requestData.duration_months;

    // Logistics estimate
    const buyerReq = requestData.requirement_id
      ? this.requirements.find((r) => r.id === requestData.requirement_id)
      : undefined;

    const origin = listing ? listing.location : 'Mumbai, MH';
    const destination = buyerReq ? buyerReq.location : 'Pune, MH';

    const logEst = generateLogisticsEstimate(
      origin,
      destination,
      requestData.quantity,
      listing?.latitude,
      listing?.longitude,
      buyerReq?.latitude,
      buyerReq?.longitude
    );

    const newReq: SupplyRequest = {
      ...requestData,
      id: `req-sub-${Date.now()}`,
      calculated_carbon_value: carbonValue,
      calculated_logistics_cost: logEst.estimatedCost,
      calculated_total_value: carbonValue + logEst.estimatedCost,
      status: 'PENDING',
      created_at: new Date().toISOString(),
    };

    this.requests = [newReq, ...this.requests];
    setStoredItem(STORAGE_KEYS.REQUESTS, this.requests);

    // Create Notification for Supplier
    this.createNotification({
      user_id: requestData.supplier_id,
      title: 'New CO₂ Supply Request',
      message: `${requestData.buyer_name} requested ${requestData.quantity} t/month of CO₂.`,
      link: '/requests',
    });

    return newReq;
  }

  async updateRequestStatus(
    requestId: string,
    status: 'ACCEPTED' | 'REJECTED' | 'CANCELLED'
  ): Promise<{ request: SupplyRequest; deal?: Deal; shipment?: LogisticsShipment }> {
    const reqIndex = this.requests.findIndex((r) => r.id === requestId);
    if (reqIndex === -1) throw new Error('Request not found');

    this.requests[reqIndex].status = status;
    setStoredItem(STORAGE_KEYS.REQUESTS, this.requests);
    const updatedReq = this.requests[reqIndex];

    let newDeal: Deal | undefined;
    let newShipment: LogisticsShipment | undefined;

    if (status === 'ACCEPTED') {
      // Create Deal automatically
      const listing = this.listings.find((l) => l.id === updatedReq.listing_id);
      const price = listing ? listing.price_per_tonne : 4500;

      newDeal = {
        id: `deal-cx-${Math.floor(1000 + Math.random() * 9000)}`,
        request_id: updatedReq.id,
        listing_id: updatedReq.listing_id,
        requirement_id: updatedReq.requirement_id,
        buyer_id: updatedReq.buyer_id,
        buyer_name: updatedReq.buyer_name,
        supplier_id: updatedReq.supplier_id,
        supplier_name: updatedReq.supplier_name,
        quantity: updatedReq.quantity,
        price_per_tonne: price,
        total_carbon_value: updatedReq.calculated_carbon_value,
        logistics_cost: updatedReq.calculated_logistics_cost,
        total_value: updatedReq.calculated_total_value,
        status: 'ACCEPTED',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      this.deals = [newDeal, ...this.deals];
      setStoredItem(STORAGE_KEYS.DEALS, this.deals);

      // Create Shipment automatically
      const origin = listing ? listing.location : 'Mumbai, MH';
      const destination = 'Pune, MH';
      const logEst = generateLogisticsEstimate(origin, destination, updatedReq.quantity);

      newShipment = {
        id: `shipment-${Math.floor(1000 + Math.random() * 9000)}`,
        deal_id: newDeal.id,
        origin: logEst.origin,
        destination: logEst.destination,
        distance_km: logEst.distanceKm,
        transport_mode: logEst.transportMode,
        estimated_cost: logEst.estimatedCost,
        cost_per_tonne: logEst.costPerTonne,
        estimated_delivery_days: logEst.estimatedDeliveryDays,
        status: 'PREPARING',
        tracking_code: `CX-MH-${Math.floor(10000 + Math.random() * 90000)}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      this.shipments = [newShipment, ...this.shipments];
      setStoredItem(STORAGE_KEYS.SHIPMENTS, this.shipments);

      // Notify Buyer
      this.createNotification({
        user_id: updatedReq.buyer_id,
        title: 'Supply Request Accepted!',
        message: `${updatedReq.supplier_name} accepted your request. Deal ${newDeal.id} created!`,
        link: `/deals/${newDeal.id}`,
      });
    }

    return { request: updatedReq, deal: newDeal, shipment: newShipment };
  }

  // --- DEALS & SHIPMENTS METHODS ---
  async getDeals(): Promise<Deal[]> {
    return this.deals.map((d) => ({
      ...d,
      listing: this.listings.find((l) => l.id === d.listing_id),
    }));
  }

  async getDealById(id: string): Promise<Deal | undefined> {
    const deal = this.deals.find((d) => d.id === id);
    if (!deal) return undefined;
    return {
      ...deal,
      listing: this.listings.find((l) => l.id === deal.listing_id),
    };
  }

  async getShipments(): Promise<LogisticsShipment[]> {
    return this.shipments.map((s) => ({
      ...s,
      deal: this.deals.find((d) => d.id === s.deal_id),
    }));
  }

  async getShipmentById(id: string): Promise<LogisticsShipment | undefined> {
    const shipment = this.shipments.find((s) => s.id === id);
    if (!shipment) return undefined;
    return {
      ...shipment,
      deal: this.deals.find((d) => d.id === shipment.deal_id),
    };
  }

  async updateShipmentStatus(
    shipmentId: string,
    status: 'PREPARING' | 'IN_TRANSIT' | 'DELIVERED' | 'COMPLETED'
  ): Promise<LogisticsShipment> {
    const idx = this.shipments.findIndex((s) => s.id === shipmentId);
    if (idx === -1) throw new Error('Shipment not found');

    this.shipments[idx].status = status;
    this.shipments[idx].updated_at = new Date().toISOString();
    setStoredItem(STORAGE_KEYS.SHIPMENTS, this.shipments);
    const updated = this.shipments[idx];

    // Synchronize parent Deal status
    const dealIdx = this.deals.findIndex((d) => d.id === updated.deal_id);
    if (dealIdx !== -1) {
      this.deals[dealIdx].status = status;
      this.deals[dealIdx].updated_at = new Date().toISOString();
      setStoredItem(STORAGE_KEYS.DEALS, this.deals);
    }

    return updated;
  }

  // --- NOTIFICATIONS METHODS ---
  async getNotifications(userId?: string): Promise<AppNotification[]> {
    if (!userId) return this.notifications;
    return this.notifications.filter((n) => n.user_id === userId || n.user_id === 'all');
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

  // --- ANALYTICS METRICS METHOD ---
  async getAnalytics(): Promise<AnalyticsSummary> {
    const co2Available = this.listings.reduce((sum, l) => sum + l.available_quantity, 0);
    const co2Utilized = this.deals.reduce((sum, d) => sum + d.quantity, 0) + 8920; // Seeded baseline + dynamic
    const totalPotentialValue = this.listings.reduce(
      (sum, l) => sum + l.available_quantity * l.price_per_tonne * 12,
      0
    );

    return {
      co2AvailableTotal: co2Available,
      co2UtilizedTotal: co2Utilized,
      activeSuppliersCount: 38,
      activeBuyersCount: 24,
      activeMatchesCount: this.matches.length,
      completedDealsCount: this.deals.filter((d) => d.status === 'COMPLETED' || d.status === 'DELIVERED').length + 11,
      potentialCarbonValue: totalPotentialValue,
      averageLogisticsCostPerTonne: 61.67,
      averageMatchScore: 89,
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
