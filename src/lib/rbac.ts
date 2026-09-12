import { UserRole, UserProfile } from '@/types';

export type PermissionAction =
  | 'VIEW_MARKETPLACE'
  | 'SEARCH_SUPPLY'
  | 'CREATE_REQUIREMENT'
  | 'EDIT_OWN_REQUIREMENT'
  | 'VIEW_MATCHES'
  | 'CREATE_REQUEST'
  | 'VIEW_OWN_REQUESTS'
  | 'VIEW_OWN_DEALS'
  | 'VIEW_SHIPMENTS'
  | 'UPDATE_SHIPMENT'
  | 'CREATE_DEAL'
  | 'FACILITATE_DEAL'
  | 'VIEW_SUPPLY'
  | 'VIEW_BUYER_DEMAND'
  | 'CREATE_MATCH'
  | 'CREATE_PROPOSAL'
  | 'VIEW_DEAL_PIPELINE'
  | 'MANAGE_FACILITATED_DEALS'
  | 'VIEW_LOGISTICS_STATUS'
  | 'MODIFY_BUYER_REQUIREMENT'
  | 'VIEW_AVAILABLE_SHIPMENTS'
  | 'VIEW_ASSIGNED_SHIPMENTS'
  | 'ACCEPT_SHIPMENT'
  | 'UPDATE_OWN_SHIPMENT'
  | 'ADD_TRACKING_NOTE'
  | 'ADD_TRANSPORT_DETAILS'
  | 'VIEW_ROUTE'
  | 'VIEW_DELIVERY_HISTORY'
  | 'CHANGE_DEAL_PRICE';

const ROLE_PERMISSIONS: Record<UserRole, Record<PermissionAction, boolean>> = {
  BUYER: {
    VIEW_MARKETPLACE: true,
    SEARCH_SUPPLY: true,
    CREATE_REQUIREMENT: true,
    EDIT_OWN_REQUIREMENT: true,
    VIEW_MATCHES: true,
    CREATE_REQUEST: true,
    VIEW_OWN_REQUESTS: true,
    VIEW_OWN_DEALS: true,
    VIEW_SHIPMENTS: true,
    UPDATE_SHIPMENT: false,
    CREATE_DEAL: false,
    FACILITATE_DEAL: false,
    VIEW_SUPPLY: true,
    VIEW_BUYER_DEMAND: true,
    CREATE_MATCH: false,
    CREATE_PROPOSAL: false,
    VIEW_DEAL_PIPELINE: false,
    MANAGE_FACILITATED_DEALS: false,
    VIEW_LOGISTICS_STATUS: true,
    MODIFY_BUYER_REQUIREMENT: true,
    VIEW_AVAILABLE_SHIPMENTS: false,
    VIEW_ASSIGNED_SHIPMENTS: true,
    ACCEPT_SHIPMENT: false,
    UPDATE_OWN_SHIPMENT: false,
    ADD_TRACKING_NOTE: false,
    ADD_TRANSPORT_DETAILS: false,
    VIEW_ROUTE: true,
    VIEW_DELIVERY_HISTORY: true,
    CHANGE_DEAL_PRICE: false,
  },
  DEALER: {
    VIEW_MARKETPLACE: true,
    SEARCH_SUPPLY: true,
    CREATE_REQUIREMENT: false,
    EDIT_OWN_REQUIREMENT: false,
    VIEW_MATCHES: true,
    CREATE_REQUEST: false,
    VIEW_OWN_REQUESTS: true,
    VIEW_OWN_DEALS: true,
    VIEW_SHIPMENTS: true,
    UPDATE_SHIPMENT: false,
    CREATE_DEAL: true,
    FACILITATE_DEAL: true,
    VIEW_SUPPLY: true,
    VIEW_BUYER_DEMAND: true,
    CREATE_MATCH: true,
    CREATE_PROPOSAL: true,
    VIEW_DEAL_PIPELINE: true,
    MANAGE_FACILITATED_DEALS: true,
    VIEW_LOGISTICS_STATUS: true,
    MODIFY_BUYER_REQUIREMENT: false,
    VIEW_AVAILABLE_SHIPMENTS: true,
    VIEW_ASSIGNED_SHIPMENTS: true,
    ACCEPT_SHIPMENT: false,
    UPDATE_OWN_SHIPMENT: false,
    ADD_TRACKING_NOTE: false,
    ADD_TRANSPORT_DETAILS: false,
    VIEW_ROUTE: true,
    VIEW_DELIVERY_HISTORY: true,
    CHANGE_DEAL_PRICE: true,
  },
  LOGISTICS_PROVIDER: {
    VIEW_MARKETPLACE: true,
    SEARCH_SUPPLY: false,
    CREATE_REQUIREMENT: false,
    EDIT_OWN_REQUIREMENT: false,
    VIEW_MATCHES: false,
    CREATE_REQUEST: false,
    VIEW_OWN_REQUESTS: false,
    VIEW_OWN_DEALS: false,
    VIEW_SHIPMENTS: true,
    UPDATE_SHIPMENT: true,
    CREATE_DEAL: false,
    FACILITATE_DEAL: false,
    VIEW_SUPPLY: false,
    VIEW_BUYER_DEMAND: false,
    CREATE_MATCH: false,
    CREATE_PROPOSAL: false,
    VIEW_DEAL_PIPELINE: false,
    MANAGE_FACILITATED_DEALS: false,
    VIEW_LOGISTICS_STATUS: true,
    MODIFY_BUYER_REQUIREMENT: false,
    VIEW_AVAILABLE_SHIPMENTS: true,
    VIEW_ASSIGNED_SHIPMENTS: true,
    ACCEPT_SHIPMENT: true,
    UPDATE_OWN_SHIPMENT: true,
    ADD_TRACKING_NOTE: true,
    ADD_TRANSPORT_DETAILS: true,
    VIEW_ROUTE: true,
    VIEW_DELIVERY_HISTORY: true,
    CHANGE_DEAL_PRICE: false,
  },
};

export function hasRole(user: UserProfile | null, requiredRole: UserRole): boolean {
  if (!user) return false;
  return user.role === requiredRole;
}

export function canPerformAction(user: UserProfile | null, action: PermissionAction): boolean {
  if (!user) return false;
  return ROLE_PERMISSIONS[user.role]?.[action] ?? false;
}

export function canAccessRoute(user: UserProfile | null, pathname: string): boolean {
  if (!user) return false;

  if (pathname.startsWith('/buyer') && user.role !== 'BUYER') return false;
  if (pathname.startsWith('/dealer') && user.role !== 'DEALER') return false;
  if (pathname.startsWith('/logistics') && user.role !== 'LOGISTICS_PROVIDER') return false;

  if (pathname.startsWith('/dashboard/buyer') && user.role !== 'BUYER') return false;
  if (pathname.startsWith('/dashboard/dealer') && user.role !== 'DEALER') return false;
  if (pathname.startsWith('/dashboard/logistics') && user.role !== 'LOGISTICS_PROVIDER') return false;

  return true;
}

export function getDashboardRouteForRole(role: UserRole): string {
  switch (role) {
    case 'BUYER':
      return '/buyer/dashboard';
    case 'DEALER':
      return '/dealer/dashboard';
    case 'LOGISTICS_PROVIDER':
      return '/logistics/dashboard';
    default:
      return '/buyer/dashboard';
  }
}
