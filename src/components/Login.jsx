import { useState } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { AlertCircle, CheckCircle2, Lock } from 'lucide-react';
import { errorMessage } from '@/lib/convexError';

const Field = ({ id, label, ...props }) => (
  <div className="space-y-2">
    <Label htmlFor={id}>{label}</Label>
    <Input id={id} required className="text-base" {...props} />
  </div>
);

const TextLink = ({ onClick, children }) => (
  <button type="button" onClick={onClick} className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
    {children}
  </button>
);

const Login = ({
  title = 'Therapist Access',
  subtitle = 'Please sign in to view the progress dashboard.',
  onLogin,
  onSignUp,
  onRequestReset,
  onResetPassword,
  footer,
}) => {
  const [view, setView] = useState('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [busy, setBusy] = useState(false);

  const go = (next, message = null) => {
    setView(next);
    setError(null);
    setNotice(message);
    setPassword('');
    setConfirm('');
  };

  const run = async (task) => {
    setBusy(true);
    setError(null);
    try {
      await task();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if ((view === 'signup' || view === 'reset') && password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    if (view === 'signin') run(() => onLogin(email, password));
    if (view === 'signup') run(() => onSignUp(name, email, password));
    if (view === 'forgot') {
      run(async () => {
        await onRequestReset(email);
        go('reset', `If ${email.trim()} has an account, a 6-digit code is on its way. Check your inbox (and spam).`);
      });
    }
    if (view === 'reset') {
      run(async () => {
        await onResetPassword(email, code, password);
        setCode('');
        go('signin', 'Password updated. Sign in with your new password.');
      });
    }
  };

  const headings = {
    signin: [title, subtitle],
    signup: ['Create your account', 'Use the email address the parent approved for you.'],
    forgot: ['Reset your password', "Enter your account email and we'll send you a reset code."],
    reset: ['Enter your reset code', 'Type the 6-digit code from the email and choose a new password.'],
  };
  const submitLabels = { signin: 'Sign In', signup: 'Create Account', forgot: 'Send Reset Code', reset: 'Set New Password' };
  const [heading, subheading] = headings[view];

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 overflow-y-auto">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-lg border">
        <div className="text-center">
          <Lock className="mx-auto h-12 w-12 text-indigo-600" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">{heading}</h2>
          <p className="mt-2 text-sm text-gray-600">{subheading}</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {view === 'signup' && (
            <Field id="name" label="Your name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
          )}
          <Field
            id="email" label="Email Address" type="email" autoComplete="email" placeholder="you@example.com"
            value={email} onChange={(e) => setEmail(e.target.value)}
          />
          {view === 'reset' && (
            <Field
              id="code" label="Reset code" inputMode="numeric" autoComplete="one-time-code" maxLength={6}
              placeholder="123456" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            />
          )}
          {view !== 'forgot' && (
            <Field
              id="password" label={view === 'reset' ? 'New password' : 'Password'} type="password"
              autoComplete={view === 'signin' ? 'current-password' : 'new-password'}
              minLength={view === 'signin' ? undefined : 8} placeholder="••••••••"
              value={password} onChange={(e) => setPassword(e.target.value)}
            />
          )}
          {(view === 'signup' || view === 'reset') && (
            <Field
              id="confirm" label="Confirm password" type="password" autoComplete="new-password" minLength={8}
              placeholder="••••••••" value={confirm} onChange={(e) => setConfirm(e.target.value)}
            />
          )}

          {notice && (
            <div className="flex items-start p-3 text-sm text-green-800 bg-green-100 rounded-lg">
              <CheckCircle2 className="w-5 h-5 mr-2 shrink-0" />
              <span>{notice}</span>
            </div>
          )}
          {error && (
            <div className="flex items-start p-3 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
              <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button type="submit" className="w-full text-base py-3" disabled={busy}>
            {busy ? 'Please wait…' : submitLabels[view]}
          </Button>
        </form>

        <div className="flex flex-col items-center gap-2">
          {view === 'signin' && (
            <>
              <TextLink onClick={() => go('forgot')}>Forgot your password?</TextLink>
              {onSignUp && <TextLink onClick={() => go('signup')}>New therapist? Create an account</TextLink>}
            </>
          )}
          {view === 'forgot' && <TextLink onClick={() => go('reset')}>I already have a code</TextLink>}
          {view === 'reset' && <TextLink onClick={() => go('forgot')}>Send a new code</TextLink>}
          {view !== 'signin' && <TextLink onClick={() => go('signin')}>Back to sign in</TextLink>}
        </div>

        {footer ?? (
          <p className="text-xs text-center text-gray-500">
            Access to this system is restricted to authorized personnel. All activities are monitored.
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;
