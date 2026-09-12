export type UserRole = 'SUPPLIER' | 'BUYER' | 'ADMIN';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  company: string;
  role: UserRole;
  location: string;
  latitude: number;
  longitude: number;
  avatarUrl?: string;
  createdAt: string;
}

export type SourceType = 'Cement' | 'Steel' | 'Power' | 'Chemical' | 'Other';
export type ListingStatus = 'ACTIVE' | 'DRAFT' | 'PAUSED' | 'FULLY_BOOKED';

export interface CarbonListing {
  id: string;
  supplier_id: string;
  supplier_name: string;
  title: string;
  source_type: SourceType;
  location: string;
  latitude: number;
  longitude: number;
  available_quantity: number; // in tonnes/month
  unit: string;
  purity: number; // percentage (e.g. 99.2)
  capture_method: string;
  temperature?: string;
  pressure?: string;
  availability_date: string;
  price_per_tonne: number; // in INR ₹
  status: ListingStatus;
  created_at: string;
  updated_at: string;
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
  listing_id: string;
  requirement_id: string;
  created_at: string;
  listing?: CarbonListing;
  requirement?: BuyerRequirement;
}

export type RequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';

export interface SupplyRequest {
  id: string;
  match_id?: string;
  listing_id: string;
  requirement_id?: string;
  buyer_id: string;
  buyer_name: string;
  supplier_id: string;
  supplier_name: string;
  quantity: number; // tonnes/month
  start_date: string;
  duration_months: number;
  message?: string;
  calculated_carbon_value: number;
  calculated_logistics_cost: number;
  calculated_total_value: number;
  status: RequestStatus;
  created_at: string;
  listing?: CarbonListing;
}

export type DealStatus =
  | 'REQUESTED'
  | 'ACCEPTED'
  | 'PREPARING'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'COMPLETED';

export interface Deal {
  id: string;
  request_id: string;
  listing_id: string;
  requirement_id?: string;
  buyer_id: string;
  buyer_name: string;
  supplier_id: string;
  supplier_name: string;
  quantity: number;
  price_per_tonne: number;
  total_carbon_value: number;
  logistics_cost: number;
  total_value: number;
  status: DealStatus;
  created_at: string;
  updated_at: string;
  listing?: CarbonListing;
}

export type ShipmentStatus = 'PREPARING' | 'IN_TRANSIT' | 'DELIVERED' | 'COMPLETED';

export interface LogisticsShipment {
  id: string;
  deal_id: string;
  origin: string;
  destination: string;
  distance_km: number;
  transport_mode: string;
  estimated_cost: number;
  cost_per_tonne: number;
  estimated_delivery_days: number;
  status: ShipmentStatus;
  tracking_code: string;
  created_at: string;
  updated_at: string;
  deal?: Deal;
}

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  created_at: string;
}

export interface AnalyticsSummary {
  co2AvailableTotal: number;
  co2UtilizedTotal: number;
  activeSuppliersCount: number;
  activeBuyersCount: number;
  activeMatchesCount: number;
  completedDealsCount: number;
  potentialCarbonValue: number;
  averageLogisticsCostPerTonne: number;
  averageMatchScore: number;
}
