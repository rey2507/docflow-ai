import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthService } from './services/auth/auth.service';
import MainDashboard from './components/MainDashboard';
import type { User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from './lib/supabase/client';
import { formatErrorForUser, normalizeAuthError } from './lib/utils/error-normalization';
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
  const [pendingConfirmationEmail, setPendingConfirmationEmail] = useState('');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  const setFriendlyAuthError = (error: unknown) => {
    const normalized = normalizeAuthError(error);
    setAuthError(formatErrorForUser(normalized));

    if (normalized.code === 'AUTH_EMAIL_NOT_CONFIRMED') {
      setPendingConfirmationEmail(email.trim());
    }
  };

  if (!isSupabaseConfigured) {
    return (
      <div className="app-shell app-shell--panel app-shell--unavailable">
        <div className="app-shell__card app-shell__card--wide app-shell__card--centered">
          <div className="app-shell__status-pill">Temporarily unavailable</div>
          <h1 className="app-shell__title app-shell__title--spaced">DocFlow AI</h1>
          <p className="app-shell__body">
            This workspace is currently unavailable. Our team has been notified and service will be restored shortly.
          </p>
          <p className="app-shell__muted app-shell__muted--spaced">
            If you need immediate access, please contact support.
          </p>
          <p className="app-shell__muted app-shell__muted--reset">Please try again in a few minutes.</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    // Resolve initial session
    AuthService.getSession()
      .then(({ session, error }) => {
        if (error) {
          setFriendlyAuthError(error);
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
        setPendingConfirmationEmail('');
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
    setPendingConfirmationEmail('');

    const fn = authMode === 'signup' ? AuthService.signUp : AuthService.signIn;
    const { data, error } = await fn(email, password);

    setIsSubmitting(false);

    if (error) {
      setFriendlyAuthError(error);
      return;
    }

    if (authMode === 'signup') {
      if (data.session?.user) {
        setUser(data.session.user);
        return;
      }

  setPendingConfirmationEmail(email.trim());
  setAuthMessage(`Account created. We sent a confirmation email to ${email.trim()}. Confirm your address, then sign in.`);
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

  const handleResendConfirmation = async () => {
    const targetEmail = pendingConfirmationEmail || email.trim();
    if (!targetEmail) {
      setAuthError('Enter your email address first so the confirmation message can be resent.');
      return;
    }

    setAuthError('');
    setAuthMessage('');
    setIsSubmitting(true);

    const { error } = await AuthService.resendConfirmation(targetEmail);

    setIsSubmitting(false);

    if (error) {
      setFriendlyAuthError(error);
      return;
    }

    setPendingConfirmationEmail(targetEmail);
    setAuthMessage(`We sent a new confirmation email to ${targetEmail}. Check your inbox and spam folder.`);
  };

  const handleMagicLink = async () => {
    const targetEmail = email.trim();
    if (!targetEmail) {
      setAuthError('Enter your email address first to receive a magic sign-in link.');
      return;
    }

    setAuthError('');
    setAuthMessage('');
    setIsSubmitting(true);

    const { error } = await AuthService.sendMagicLink(targetEmail);

    setIsSubmitting(false);

    if (error) {
      setFriendlyAuthError(error);
      return;
    }

    setAuthMessage(`We sent a magic sign-in link to ${targetEmail}. Use that link to finish signing in.`);
  };

  if (loading) {
    return (
      <div className="app-shell app-shell--panel">
        <div className="app-shell__card app-shell__card--narrow app-shell__card--centered" aria-busy="true">
          <h1 className="app-shell__title app-shell__title--compact">DocFlow AI</h1>
          <p className="app-shell__muted app-shell__muted--section">Restoring your session…</p>
          <div className="app-shell__loading-line" />
          <p className="app-shell__muted app-shell__muted--reset">Preparing the workspace and verifying your account.</p>
        </div>
      </div>
    );
  }

  if (!user) {
    const isSignIn = authMode === 'signin';

    return (
      <div className="app-shell app-shell--panel">
        <div className="app-shell__card app-shell__card--narrow">
          <h1 className="app-shell__title app-shell__title--compact">DocFlow AI</h1>
          <p className="app-shell__muted app-shell__muted--section">
            {isSignIn ? 'Sign in to your workspace' : 'Create your account'}
          </p>
          <p className="app-shell__body app-shell__body--compact">
            {isSignIn
              ? 'Use your email and password, or request a magic link if you prefer passwordless sign-in.'
              : 'Create an account, confirm your email, and continue into the document workflow.'}
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
                autoComplete="email"
                spellCheck={false}
                required
                className="app-shell__input"
                disabled={isSubmitting}
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
                autoComplete={isSignIn ? 'current-password' : 'new-password'}
                required
                className="app-shell__input"
                disabled={isSubmitting}
              />
            </div>
            {pendingConfirmationEmail && (
              <p className="app-shell__notice">
                Confirmation email pending for {pendingConfirmationEmail}. You can resend it below.
              </p>
            )}
            {authMessage && (
              <p className="app-shell__message" role="status">{authMessage}</p>
            )}
            {authError && (
              <p className="app-shell__error" role="alert">{authError}</p>
            )}
            <button
              type="submit"
              className="app-shell__button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Working…' : isSignIn ? 'Sign in' : 'Create account'}
            </button>
            {isSignIn && (
              <button
                type="button"
                className="app-shell__button app-shell__button--secondary"
                disabled={isSubmitting}
                onClick={handleMagicLink}
              >
                {isSubmitting ? 'Working…' : 'Email me a magic link'}
              </button>
            )}
          </form>
          {pendingConfirmationEmail && (
            <div className="app-shell__actions">
              <button
                type="button"
                className="app-shell__link-button"
                disabled={isSubmitting}
                onClick={handleResendConfirmation}
              >
                Resend confirmation email
              </button>
            </div>
          )}
          <p className="app-shell__muted app-shell__muted--centered">
            {isSignIn ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={() => {
                setAuthError('');
                setAuthMessage('');
                setPendingConfirmationEmail('');
                setAuthMode(isSignIn ? 'signup' : 'signin');
              }}
              className="app-shell__link-button"
            >
              {isSignIn ? 'Create an account' : 'Sign in'}
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
