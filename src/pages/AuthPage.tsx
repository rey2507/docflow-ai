import React, { useState } from 'react';
import { AuthService } from '../services/auth/auth.service';
import { formatErrorForUser, normalizeAuthError } from '../lib/utils/error-normalization';
import { isSupabaseConfigured } from '../lib/supabase/client';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

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
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        backgroundColor: 'var(--color-bg)',
      }}>
        <div style={{
          width: '100%',
          maxWidth: '28rem',
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--border-radius)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)',
          padding: 'var(--spacing-lg)',
          textAlign: 'center',
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 'var(--spacing-md)',
            padding: 'var(--spacing-xs) var(--spacing-sm)',
            borderRadius: '9999px',
            backgroundColor: 'var(--color-border)',
            color: 'var(--color-text)',
            fontSize: 'var(--font-size-xs)',
            fontWeight: 'var(--font-weight-bold)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            Temporarily unavailable
          </div>
          <h1 style={{
            fontSize: 'var(--font-size-2xl)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--color-text)',
            marginBottom: 'var(--spacing-sm)',
            letterSpacing: '-0.025em',
          }}>DocFlow AI</h1>
          <p style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-muted)',
            marginBottom: 'var(--spacing-lg)',
          }}>
            This workspace is currently unavailable. Our team has been notified and service will be restored shortly.
          </p>
          <p style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-muted)',
            marginTop: 'var(--spacing-lg)',
            textAlign: 'center',
          }}>
            If you need immediate access, please contact support.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      backgroundColor: 'var(--color-bg)',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '28rem',
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--border-radius)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
        padding: 'var(--spacing-lg)',
        textAlign: 'center',
      }}>
        <h1 style={{
          fontSize: 'var(--font-size-2xl)',
          fontWeight: 'var(--font-weight-bold)',
          color: 'var(--color-text)',
          marginBottom: 'var(--spacing-sm)',
          letterSpacing: '-0.025em',
        }}>DocFlow AI</h1>
        <p style={{
          fontSize: 'var(--font-size-sm)',
          color: 'var(--color-muted)',
          marginBottom: 'var(--spacing-sm)',
        }}>{isSignIn ? 'Sign in to your workspace' : 'Create your account'}</p>
        <p style={{
          fontSize: 'var(--font-size-sm)',
          color: 'var(--color-muted)',
          marginBottom: 'var(--spacing-lg)',
          lineHeight: '1.625',
        }}>
          {isSignIn
            ? 'Use your email and password, or request a magic link if you prefer passwordless sign-in.'
            : 'Create an account, confirm your email, and continue into the document workflow.'}
        </p>
        <form onSubmit={handleAuth} style={{ textAlign: 'left' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="email" style={{
              display: 'block',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-text)',
              marginBottom: 'var(--spacing-xs)',
            }}>Email</label>
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
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="password" style={{
              display: 'block',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-text)',
              marginBottom: 'var(--spacing-xs)',
            }}>Password</label>
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
            <div style={{
              fontSize: 'var(--font-size-sm)',
              padding: 'var(--spacing-sm)',
              borderRadius: 'var(--border-radius)',
              border: '1px solid var(--color-primary)',
              backgroundColor: 'var(--color-primary-light)',
              color: 'var(--color-primary-dark)',
              marginBottom: 'var(--spacing-sm)',
            }} role="status">
              Confirmation email pending for {pendingConfirmationEmail}. You can resend it below.
            </div>
          )}
          {authMessage && (
            <div style={{
              fontSize: 'var(--font-size-sm)',
              padding: 'var(--spacing-sm)',
              borderRadius: 'var(--border-radius)',
              border: '1px solid var(--color-primary)',
              backgroundColor: 'var(--color-primary-light)',
              color: 'var(--color-primary-dark)',
              marginBottom: 'var(--spacing-sm)',
            }} role="status">{authMessage}</div>
          )}
          {authError && (
            <div style={{
              fontSize: 'var(--font-size-sm)',
              padding: 'var(--spacing-sm)',
              borderRadius: 'var(--border-radius)',
              border: '1px solid var(--color-danger)',
              backgroundColor: '#fef2f2',
              color: '#991b1b',
              marginBottom: 'var(--spacing-sm)',
            }} role="alert">{authError}</div>
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
              className="w-full"
              disabled={isSubmitting}
              onClick={handleMagicLink}
              style={{ marginTop: '0.75rem' }}
            >
              {isSubmitting ? 'Working…' : 'Email me a magic link'}
            </Button>
          )}
        </form>
        {pendingConfirmationEmail && (
          <div style={{ marginTop: '0.75rem', textAlign: 'center' }}>
            <button
              type="button"
              onClick={handleResendConfirmation}
              disabled={isSubmitting}
              style={{
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-primary)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'none',
              }}
            >
              Resend confirmation email
            </button>
          </div>
        )}
        <p style={{
          fontSize: 'var(--font-size-sm)',
          color: 'var(--color-muted)',
          marginTop: 'var(--spacing-lg)',
          textAlign: 'center',
        }}>
          {isSignIn ? "Don't have an account? " : 'Already have an account? '}
          <button
            type="button"
            onClick={() => {
              setAuthError('');
              setAuthMessage('');
              setPendingConfirmationEmail('');
              setAuthMode(isSignIn ? 'signup' : 'signin');
            }}
            style={{
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-primary)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'none',
            }}
          >
            {isSignIn ? 'Create an account' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
