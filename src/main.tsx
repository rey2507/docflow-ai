import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthService } from './services/auth/auth.service';
import MainDashboard from './components/MainDashboard';
import type { User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase, supabaseConfigError } from './lib/supabase/client';
import './main.css';

/**
 * App root — handles auth state and renders the dashboard.
 */
function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  if (!isSupabaseConfigured) {
    return (
      <div className="app-shell app-shell--panel">
        <div className="app-shell__card app-shell__card--wide">
          <h1 className="app-shell__title app-shell__title--spaced">DocFlow AI</h1>
          <p className="app-shell__body">Supabase is not configured for this deployment.</p>
          <p className="app-shell__muted app-shell__muted--spaced">{supabaseConfigError}</p>
          <p className="app-shell__muted app-shell__muted--reset">
            Rebuild the site after setting the environment variables in the deployment environment.
          </p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    // Resolve initial session
    AuthService.getSession()
      .then(({ session, error }) => {
        if (error) {
          setAuthError(error.message);
        }

        setUser(session?.user ?? null);
      })
      .finally(() => {
        setLoading(false);
      });

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);

      if (event === 'SIGNED_IN' && session?.user) {
        setAuthError('');
        setAuthMessage('');
      }

      if (event === 'SIGNED_OUT') {
        setAuthMessage('');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthMessage('');
    setIsSubmitting(true);

    const fn = authMode === 'signup' ? AuthService.signUp : AuthService.signIn;
    const { data, error } = await fn(email, password);

    setIsSubmitting(false);

    if (error) {
      setAuthError(error.message);
      return;
    }

    if (authMode === 'signup') {
      if (data.session?.user) {
        setUser(data.session.user);
        return;
      }

      setAuthMessage('Account created. Check your email to confirm your address, then sign in.');
      setPassword('');
      setAuthMode('signin');
      return;
    }

    if (data.session?.user) {
      setUser(data.session.user);
      return;
    }

    setAuthError('Sign-in did not return a session. Check your Supabase auth settings and try again.');
  };

  if (loading) {
    return (
      <div className="app-shell">
        <p className="app-shell__muted">Loading…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="app-shell app-shell--panel">
        <div className="app-shell__card app-shell__card--narrow">
          <h1 className="app-shell__title app-shell__title--compact">DocFlow AI</h1>
          <p className="app-shell__muted app-shell__muted--section">
            {authMode === 'signin' ? 'Sign in to your account' : 'Create a new account'}
          </p>
          <form onSubmit={handleAuth}>
            <div className="app-shell__field">
              <label className="app-shell__label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="app-shell__input"
              />
            </div>
            <div className="app-shell__field">
              <label className="app-shell__label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="app-shell__input"
              />
            </div>
            {authMessage && (
              <p className="app-shell__message">{authMessage}</p>
            )}
            {authError && (
              <p className="app-shell__error">{authError}</p>
            )}
            <button
              type="submit"
              className="app-shell__button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Working...' : authMode === 'signin' ? 'Sign In' : 'Sign Up'}
            </button>
          </form>
          <p className="app-shell__muted app-shell__muted--centered">
            {authMode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
              className="app-shell__link-button"
            >
              {authMode === 'signin' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    );
  }

  return <MainDashboard userId={user.id} />;
}

const root = createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
