export interface UserRole {
  code: string | number;
  name: string;
}

export interface AuthUser {
  id?: string;
  _id?: string;
  name?: string;
  email?: string;
  role: UserRole | string;
  exp?: number;
  iat?: number;
  [key: string]: unknown;
}

export interface Permission {
  canView: boolean;
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canViewAll: boolean;
  route: string;
  icon: string;
  name: string;
  moduleName: string;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  permissions: Record<string, Permission>;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (endpoint: string, credentials: Record<string, string>) => Promise<void>;
  logout: (logoutEndpoint?: string) => Promise<void>;
}

export const GRID_ROLE_SLUG_MAP: Record<string, string> = {
  '1': 'admin',
  '15': 'agency',
  '16': 'agent',
  '17': 'developer',
  '24': 'GridAdvisor',
  '25': 'gridreferralpartner',
};

export const GRID_ROLE_CODES = ['1', '15', '16', '17', '24', '25'];

// Keep these for backwards compatibility temporarily
export const VAULT_ROLE_SLUG_MAP = GRID_ROLE_SLUG_MAP;
export const VAULT_ROLE_CODES = GRID_ROLE_CODES;
