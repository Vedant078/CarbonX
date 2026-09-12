export type UserRole = 'BUYER' | 'DEALER' | 'LOGISTICS';

export interface BuyerProfileData {
  industry?: string;
  primaryApplication?: string;
  estimatedCo2Req?: string;
  monthlyRequirement?: string | number;
  preferredPurity?: string | number;
  requiredPurity?: string | number;
  preferredDeliveryLocation?: string;
  preferredLocation?: string;
  usageObjective?: string;
  sustainabilityGoals?: string;
}

export interface DealerProfileData {
  tradingName?: string;
  businessCategory?: string;
  organizationType?: string;
  areasServed?: string;
  operatingRegion?: string;
  industriesServed?: string;
  commercialExperience?: string;
  dealVolume?: string;
  expectedMonthlyVolume?: string | number;
  businessDescription?: string;
}

export interface LogisticsProfileData {
  logisticsCompanyName?: string;
  serviceRegions?: string;
  serviceRegion?: string;
  co2TransportCapability?: string | boolean;
  approxCapacity?: string;
  transportModes?: string;
  transportType?: string;
  fleetInformation?: string;
  fleetSize?: string | number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  company: string;
  role: UserRole;
  location: string;
  latitude?: number;
  longitude?: number;
  avatarUrl?: string;
  buyerProfile?: BuyerProfileData;
  dealerProfile?: DealerProfileData;
  logisticsProfile?: LogisticsProfileData;
  createdAt: string;
}

// Marketplace Supply Entity (NOT an authenticated user)
export type SourceType = 'Cement' | 'Steel' | 'Power' | 'Chemical' | 'Other';
export type VerificationStatus = 'VERIFIED' | 'PENDING_AUDIT' | 'CERTIFIED';

export interface CarbonSource {
  id: string;
  company_name: string;
  facility_name: string;
  industry: SourceType;
  location: string;
  latitude: number;
  longitude: number;
  available_quantity: number; // in tonnes/month
  unit: string;
  purity: number; // percentage (e.g. 99.2)
  capture_method: string;
  temperature?: string;
  pressure?: string;
  price_per_tonne: number; // in INR ₹
  availability_date: string;
  verification_status: VerificationStatus;
  created_at: string;
  updated_at: string;
}

// Alias for backward compatibility if components reference CarbonListing
export type CarbonListing = CarbonSource;

// --- B2B COMPETITIVE BIDDING TYPES ---
export type BiddingOpportunityStatus = 'UPCOMING' | 'LIVE' | 'ENDED' | 'CANCELLED' | 'AWARDED';
export type BidStatus = 'ACTIVE' | 'WINNING' | 'OUTBID' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN' | 'LOST';

export interface BiddingOpportunity {
  id: string;
  carbon_source_id: string;
  dealer_id?: string;
  dealer_name?: string;
  title: string;
  description: string;
  quantity: number; // in tonnes
  unit: string;
  starting_price: number; // in INR ₹/tonne
  current_highest_bid: number; // in INR ₹/tonne
  minimum_bid_increment: number; // in INR ₹/tonne
  bid_count: number;
  winning_bid_id?: string;
  source_company_name?: string;
  source_location?: string;
  auction_start_time: string;
  auction_end_time: string;
  status: BiddingOpportunityStatus;
  created_at: string;
  updated_at: string;
  source?: CarbonSource;
}

export interface Bid {
  id: string;
  bidding_opportunity_id: string;
  bidder_id: string;
  bidder_name: string;
  bidder_company: string;
  amount_per_tonne: number; // in INR ₹/tonne
  quantity: number; // in tonnes
  total_amount: number; // amount_per_tonne * quantity
  status: BidStatus;
  created_at: string;
  updated_at: string;
  opportunity?: BiddingOpportunity;
  title?: string;
}

export type ApplicationType =
  | 'Synthetic Fuel'
  | 'Construction'
  | 'Greenhouse'
  | 'Algae'
  | 'Chemicals'
  | 'Other';

export type RequirementStatus = 'ACTIVE' | 'MET' | 'CANCELLED';

export interface BuyerRequirement {
  id: string;
  buyer_id: string;
  buyer_name: string;
  title: string;
  application: ApplicationType;
  required_quantity: number; // in tonnes/month
  required_purity: number; // min percentage (e.g. 99.0)
  location: string;
  latitude: number;
  longitude: number;
  max_distance: number; // in km
  max_price: number; // in INR ₹/tonne
  frequency: string;
  status: RequirementStatus;
  created_at: string;
}

export interface MatchScoreBreakdown {
  score: number; // 0 - 100
  quantityScore: number;
  purityScore: number;
  distanceScore: number;
  priceScore: number;
  applicationScore: number;
  reasoning: string[];
}

export interface MatchRecord extends MatchScoreBreakdown {
  id: string;
  carbon_source_id: string;
  requirement_id: string;
  created_at: string;
  source?: CarbonSource;
  requirement?: BuyerRequirement;
  listing?: CarbonSource;
}

export type ProposalStatus =
  | 'IDENTIFIED'
  | 'MATCHED'
  | 'PROPOSED'
  | 'NEGOTIATING'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'REJECTED';

export interface FacilitatedDeal {
  id: string;
  dealer_id?: string;
  dealer_name?: string;
  buyer_id: string;
  buyer_name: string;
  carbon_source_id: string;
  carbon_source_name: string;
  requirement_id?: string;
  bidding_opportunity_id?: string;
  bid_id?: string;
  quantity: number;
  price_per_tonne: number;
  total_carbon_value: number;
  logistics_cost: number;
  total_value: number;
  match_score: number;
  commission: number; // in INR ₹ (e.g. 5% of deal value)
  status: ProposalStatus;
  created_at: string;
  updated_at: string;
  source?: CarbonSource;
  requirement?: BuyerRequirement;
}

export type Deal = FacilitatedDeal;

export type ShipmentStatus =
  | 'AWAITING_LOGISTICS'
  | 'PREPARING'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'DELIVERED';

export interface LogisticsShipment {
  id: string;
  deal_id: string;
  logistics_provider_id?: string;
  logistics_provider_name?: string;
  origin: string;
  destination: string;
  distance_km: number;
  quantity: number;
  transport_mode: string;
  vehicle_type: string;
  driver_name: string;
  estimated_cost: number;
  cost_per_tonne: number;
  estimated_delivery_days: number;
  pickup_date?: string;
  estimated_delivery?: string;
  status: ShipmentStatus;
  tracking_code: string;
  tracking_notes: string[];
  created_at: string;
  updated_at: string;
  deal?: FacilitatedDeal;
}

export interface AppNotification {
  id: string;
  user_id: string;
  role_target?: UserRole | 'ALL';
  title: string;
  message: string;
  link?: string;
  read: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  user_name: string;
  role: UserRole;
  action: string;
  resource: string;
  details?: string;
  timestamp: string;
}

export interface AnalyticsSummary {
  co2AvailableTotal: number;
  co2RequiredTotal: number;
  co2UtilizedTotal: number;
  activeSuppliersCount: number;
  activeBuyersCount: number;
  activeMatchesCount: number;
  activeNegotiationsCount: number;
  facilitatedDealValueTotal: number;
  potentialCommissionTotal: number;
  availableShipmentsCount: number;
  activeShipmentsCount: number;
  inTransitShipmentsCount: number;
  deliveredThisMonthCount: number;
  totalLogisticsValue: number;
}
