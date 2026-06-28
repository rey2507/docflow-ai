import React, { useState } from 'react';
import { AuthService } from '../services/auth/auth.service';
import { formatErrorForUser, normalizeAuthError } from '../lib/utils/error-normalization';
import { isSupabaseConfigured } from '../lib/supabase/client';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { PageContainer, SectionContainer } from '../components/ui/layout';
import { Card, CardBody } from '../components/ui/card';

interface AuthPageProps {
  onAuthenticated: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onAuthenticated }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const [pendingConfirmationEmail, setPendingConfirmationEmail] = useState('');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setFriendlyAuthError = (error: unknown) => {
    const normalized = normalizeAuthError(error);
    setAuthError(formatErrorForUser(normalized));
    if (normalized.code === 'AUTH_EMAIL_NOT_CONFIRMED') {
      setPendingConfirmationEmail(email.trim());
    }
  };

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
        onAuthenticated();
        return;
      }
      setPendingConfirmationEmail(email.trim());
      setAuthMessage(`Account created. We sent a confirmation email to ${email.trim()}. Confirm your address, then sign in.`);
      setPassword('');
      setAuthMode('signin');
      return;
    }

    if (data.session?.user) {
      onAuthenticated();
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

  const isSignIn = authMode === 'signin';

  if (!isSupabaseConfigured) {
    return (
      <PageContainer variant="narrow">
        <SectionContainer spacing="md">
          <div className="flex justify-center">
            <Card>
              <CardBody>
                <div className="text-center">
                  <span className="inline-flex items-center justify-center rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-600">
                    Temporarily unavailable
                  </span>
                  <h1 className="mt-4 text-2xl font-bold text-slate-900">DocFlow AI</h1>
                  <p className="mt-2 text-sm text-slate-600">
                    This workspace is currently unavailable. Our team has been notified and service will be restored shortly.
                  </p>
                  <p className="mt-4 text-sm text-slate-600">
                    If you need immediate access, please contact support.
                  </p>
                </div>
              </CardBody>
            </Card>
          </div>
        </SectionContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer variant="narrow">
      <SectionContainer spacing="md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900">DocFlow AI</h1>
          <p className="mt-1 text-sm text-slate-600">
            {isSignIn ? 'Sign in to your workspace' : 'Create your account'}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            {isSignIn
              ? 'Use your email and password, or request a magic link if you prefer passwordless sign-in.'
              : 'Create an account, confirm your email, and continue into the document workflow.'}
          </p>
        </div>

        <Card>
          <CardBody>
            <form onSubmit={handleAuth} className="text-left">
              <div className="mb-4">
                <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  autoComplete="email"
                  spellCheck={false}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="mb-4">
                <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete={isSignIn ? 'current-password' : 'new-password'}
                  required
                  disabled={isSubmitting}
                />
              </div>

              {pendingConfirmationEmail && (
                <div className="mb-3 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700" role="status">
                  Confirmation email pending for {pendingConfirmationEmail}. You can resend it below.
                </div>
              )}

              {authMessage && (
                <div className="mb-3 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700" role="status">
                  {authMessage}
                </div>
              )}

              {authError && (
                <div className="mb-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700" role="alert">
                  {authError}
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Working…' : isSignIn ? 'Sign in' : 'Create account'}
              </Button>

              {isSignIn && (
                <Button
                  type="button"
                  variant="secondary"
                  className="mt-3 w-full"
                  disabled={isSubmitting}
                  onClick={handleMagicLink}
                >
                  {isSubmitting ? 'Working…' : 'Email me a magic link'}
                </Button>
              )}

              {pendingConfirmationEmail && (
                <div className="mt-3 text-center">
                  <button
                    type="button"
                    onClick={handleResendConfirmation}
                    disabled={isSubmitting}
                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    Resend confirmation email
                  </button>
                </div>
              )}
            </form>

            <p className="mt-6 text-center text-sm text-slate-600">
              {isSignIn ? "Don't have an account? " : 'Already have an account? '}
              <button
                type="button"
                onClick={() => {
                  setAuthError('');
                  setAuthMessage('');
                  setPendingConfirmationEmail('');
                  setAuthMode(isSignIn ? 'signup' : 'signin');
                }}
                className="font-medium text-blue-600 hover:underline"
              >
                {isSignIn ? 'Create an account' : 'Sign in'}
              </button>
            </p>
          </CardBody>
        </Card>
      </SectionContainer>
    </PageContainer>
  );
};

export default AuthPage;