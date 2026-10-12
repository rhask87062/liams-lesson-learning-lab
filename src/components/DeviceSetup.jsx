import { useState } from 'react';
import { useAction, useMutation } from 'convex/react';
import { ConvexError } from 'convex/values';
import { BarChart3, ShieldCheck, Tablet } from 'lucide-react';
import { api } from '../../convex/_generated/api';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import Login from '@/components/Login.jsx';
import { errorMessage } from '@/lib/convexError';

function guessDeviceName() {
  const ua = navigator.userAgent;
  if (/iPad|Macintosh.*Mobile/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return "Liam's iPad";
  if (/iPhone/.test(ua)) return "Liam's iPhone";
  if (/CrOS/.test(ua)) return "Liam's Chromebook";
  if (/Android/.test(ua)) return /Mobile/.test(ua) ? "Liam's phone" : "Liam's tablet";
  return "Liam's computer";
}

const Card = ({ children }) => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-lg border text-center">{children}</div>
  </div>
);

const DeviceSetup = ({ onApprove, onOpenDashboard }) => {
  const [step, setStep] = useState('intro');
  const [parentSession, setParentSession] = useState(null);
  const [deviceName, setDeviceName] = useState(guessDeviceName);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const signIn = useAction(api.auth.signIn);
  const requestReset = useAction(api.auth.requestPasswordReset);
  const resetPassword = useAction(api.auth.resetPassword);
  const signOut = useMutation(api.users.signOut);

  const handleParentLogin = async (email, password) => {
    const session = await signIn({ email, password });
    if (session.user.role !== 'parent') {
      signOut({ token: session.token }).catch(() => {});
      throw new ConvexError('Only the parent account can approve devices.');
    }
    setParentSession(session);
    setStep('name');
  };

  const handleApprove = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await onApprove(parentSession.token, deviceName);
      // The parent sign-in was only needed to approve; don't leave it active on Liam's device.
      signOut({ token: parentSession.token }).catch(() => {});
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  };

  if (step === 'signin') {
    return (
      <Login
        title="Parent sign-in"
        subtitle="Sign in with the parent account to approve this device."
        onLogin={handleParentLogin}
        onRequestReset={(email) => requestReset({ email })}
        onResetPassword={(email, code, newPassword) => resetPassword({ email, code, newPassword })}
        footer={
          <button type="button" className="w-full text-sm text-gray-500 hover:text-gray-700" onClick={() => setStep('intro')}>
            Cancel
          </button>
        }
      />
    );
  }

  if (step === 'name') {
    return (
      <Card>
        <ShieldCheck className="mx-auto h-12 w-12 text-green-600" />
        <h2 className="text-2xl font-bold text-gray-900">Name this device</h2>
        <p className="text-sm text-gray-600">You'll see this name in the dashboard's Access tab, where you can remove it later.</p>
        <form className="space-y-4 text-left" onSubmit={handleApprove}>
          <div className="space-y-2">
            <Label htmlFor="device-name">Device name</Label>
            <Input id="device-name" required maxLength={60} value={deviceName} onChange={(e) => setDeviceName(e.target.value)} />
          </div>
          {error && <p className="text-sm text-red-700 bg-red-100 rounded-lg p-3" role="alert">{error}</p>}
          <Button type="submit" className="w-full py-3 text-base" disabled={busy}>
            {busy ? 'Approving…' : 'Approve this device'}
          </Button>
        </form>
      </Card>
    );
  }

  return (
    <Card>
      <Tablet className="mx-auto h-12 w-12 text-indigo-600" />
      <h2 className="text-2xl font-bold text-gray-900">This device isn't set up yet</h2>
      <p className="text-sm text-gray-600">
        Liam's Lesson Learning Lab only runs on devices a parent has approved, so his progress stays accurate.
      </p>
      <div className="space-y-3">
        <Button className="w-full py-3 text-base" onClick={() => setStep('signin')}>
          <ShieldCheck className="mr-2 h-5 w-5" /> I'm the parent — approve this device
        </Button>
        <Button variant="outline" className="w-full py-3 text-base" onClick={onOpenDashboard}>
          <BarChart3 className="mr-2 h-5 w-5" /> Therapist or parent: view progress
        </Button>
      </div>
    </Card>
  );
};

export default DeviceSetup;
