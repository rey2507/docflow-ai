export type UserRole = 'admin' | 'user' | 'viewer';

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
}