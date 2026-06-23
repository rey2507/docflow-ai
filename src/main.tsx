import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthService } from './services/auth/auth.service';
import AppShell from './components/layout/AppShell';
import MainDashboard from './components/MainDashboard';
import UploadPage from './pages/UploadPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import type { User } from '@supabase/supabase-js';
import type { Page } from './types/page';
import { isSupabaseConfigured, supabase } from './lib/supabase/client';
import { formatErrorForUser, normalizeAuthError } from './lib/utils/error-normalization';

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
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  const setFriendlyAuthError = (error: unknown) => {
    const normalized = normalizeAuthError(error);
    setAuthError(formatErrorForUser(normalized));
    if (normalized.code === 'AUTH_EMAIL_NOT_CONFIRMED') {
      setPendingConfirmationEmail(email.trim());
    }
  };

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-md bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center">
          <div className="inline-flex items-center justify-center mb-4 px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-widest">
            Temporarily unavailable
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-3">DocFlow AI</h1>
          <p className="text-slate-600 text-sm leading-relaxed">
            This workspace is currently unavailable. Our team has been notified and service will be restored shortly.
          </p>
          <p className="text-slate-500 text-xs mt-4">
            If you need immediate access, please contact support.
          </p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    AuthService.getSession()
      .then(({ session, error }) => {
        if (error) setFriendlyAuthError(error);
        setUser(session?.user ?? null);
      })
      .finally(() => setLoading(false));

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
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-md bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center" aria-busy="true">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">DocFlow AI</h1>
          <p className="text-slate-500 text-sm mb-4">Restoring your session…</p>
          <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
            <div className="h-1.5 w-2/3 rounded-full bg-slate-900 animate-[loading_1.2s_ease-in-out_infinite]" />
          </div>
          <p className="text-slate-500 text-xs mt-4">Preparing the workspace and verifying your account.</p>
        </div>
      </div>
    );
  }

  if (!user) {
    const isSignIn = authMode === 'signin';
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-md bg-white rounded-xl border border-slate-200 shadow-sm p-8">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">DocFlow AI</h1>
          <p className="text-slate-500 text-sm mb-5">
            {isSignIn ? 'Sign in to your workspace' : 'Create your account'}
          </p>
          <p className="text-slate-700 text-sm mb-5 leading-relaxed">
            {isSignIn
              ? 'Use your email and password, or request a magic link if you prefer passwordless sign-in.'
              : 'Create an account, confirm your email, and continue into the document workflow.'}
          </p>
          <form onSubmit={handleAuth}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="email">
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
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white outline-none transition-colors focus:border-slate-900 focus:ring-1 focus:ring-slate-900 disabled:bg-slate-50 disabled:text-slate-500"
                disabled={isSubmitting}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="password">
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
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white outline-none transition-colors focus:border-slate-900 focus:ring-1 focus:ring-slate-900 disabled:bg-slate-50 disabled:text-slate-500"
                disabled={isSubmitting}
              />
            </div>
            {pendingConfirmationEmail && (
              <p className="text-slate-700 text-sm mb-4 p-3 rounded-lg border border-slate-200 bg-slate-50">
                Confirmation email pending for {pendingConfirmationEmail}. You can resend it below.
              </p>
            )}
            {authMessage && (
              <p className="text-blue-800 text-sm mb-4 p-3 rounded-lg border border-blue-200 bg-blue-50" role="status">{authMessage}</p>
            )}
            {authError && (
              <p className="text-rose-800 text-sm mb-4 p-3 rounded-lg border border-rose-200 bg-rose-50" role="alert">{authError}</p>
            )}
            <button
              type="submit"
              className="w-full py-2.5 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:opacity-70 disabled:cursor-wait transition-colors"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Working…' : isSignIn ? 'Sign in' : 'Create account'}
            </button>
            {isSignIn && (
              <button
                type="button"
                className="w-full py-2.5 mt-3 bg-white text-slate-900 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:opacity-70 disabled:cursor-wait transition-colors"
                disabled={isSubmitting}
                onClick={handleMagicLink}
              >
                {isSubmitting ? 'Working…' : 'Email me a magic link'}
              </button>
            )}
          </form>
          {pendingConfirmationEmail && (
            <div className="mt-3">
              <button
                type="button"
                className="text-sm font-medium text-blue-700 hover:text-blue-800 transition-colors"
                disabled={isSubmitting}
                onClick={handleResendConfirmation}
              >
                Resend confirmation email
              </button>
            </div>
          )}
          <p className="text-slate-500 text-sm mt-5 text-center">
            {isSignIn ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={() => {
                setAuthError('');
                setAuthMessage('');
                setPendingConfirmationEmail('');
                setAuthMode(isSignIn ? 'signup' : 'signin');
              }}
              className="text-sm font-medium text-blue-700 hover:text-blue-800 transition-colors"
            >
              {isSignIn ? 'Create an account' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    );
  }

  const pageContent = (() => {
    switch (currentPage) {
      case 'upload':
        return <UploadPage userId={user.id} onUploadComplete={() => setCurrentPage('dashboard')} />;
      case 'reports':
        return <ReportsPage userId={user.id} />;
      case 'settings':
        return <SettingsPage user={user} onSignOut={async () => { await supabase.auth.signOut(); setUser(null); }} />;
      default:
        return <MainDashboard userId={user.id} onNavigate={setCurrentPage} />;
    }
  })();

  return (
    <AppShell
      currentPage={currentPage}
      onNavigate={setCurrentPage}
      userEmail={user.email}
      usagePercent={84}
    >
      {pageContent}
    </AppShell>
  );
}

const root = createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
