import { supabase } from '../../lib/supabase/client';
import type { AuthResponse, AuthOtpResponse, User, Session, AuthChangeEvent } from '@supabase/supabase-js';

function getEmailRedirectTo(): string | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }

  return window.location.origin;
}

/**
 * AuthService
 * 
 * Handles all authentication-related business logic.
 * Encapsulates Supabase Auth to ensure a consistent interface across the app.
 */
export const AuthService = {
  /**
   * Register a new user with email and password.
   * Note: Profiles should be created via DB Trigger on auth.users.
   */
  async signUp(email: string, password: string): Promise<AuthResponse> {
    const response = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: getEmailRedirectTo(),
      },
    });
    return response;
  },

  /**
   * Authenticate a user with email and password.
   */
  async signIn(email: string, password: string): Promise<AuthResponse> {
    const response = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return response;
  },

  /**
   * Send a passwordless magic-link sign-in email.
   */
  async sendMagicLink(email: string): Promise<AuthOtpResponse> {
    const response = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: getEmailRedirectTo(),
        shouldCreateUser: false,
      },
    });
    return response;
  },

  /**
   * Resend the email confirmation for a pending signup.
   */
  async resendConfirmation(email: string): Promise<AuthOtpResponse> {
    const response = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: getEmailRedirectTo(),
      },
    });
    return response;
  },

  /**
   * Log the user out and clear the session.
   */
  async signOut(): Promise<{ error: Error | null }> {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  /**
   * Retrieve the current active session.
   */
  async getSession(): Promise<{ session: Session | null; error: Error | null }> {
    const { data, error } = await supabase.auth.getSession();
    return { session: data.session, error };
  },

  /**
   * Retrieve the current user profile/identity.
   */
  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  /**
   * Listen for auth state changes (login, logout, token refresh).
   */
  onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      callback(event, session);
    });
  }
};
