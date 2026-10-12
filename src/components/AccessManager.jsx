import { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { Loader2, Mail, Tablet, Trash2, UserPlus } from 'lucide-react';
import { api } from '../../convex/_generated/api';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { errorMessage } from '@/lib/convexError';

const formatDate = (ms) => (ms ? new Date(ms).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—');

// Two-step remove button so nothing is deleted by a single stray tap.
function RemoveButton({ label, onRemove }) {
  const [confirming, setConfirming] = useState(false);
  if (!confirming) {
    return (
      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => setConfirming(true)}>
        <Trash2 className="h-4 w-4 mr-1" /> Remove
      </Button>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <Button variant="destructive" size="sm" onClick={onRemove}>{label}</Button>
      <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>Cancel</Button>
    </div>
  );
}

const Section = ({ icon, title, description, children }) => (
  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 space-y-4">
    <div>
      <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
        {icon} {title}
      </h2>
      <p className="mt-1 text-sm text-gray-600">{description}</p>
    </div>
    {children}
  </div>
);

export default function AccessManager({ sessionToken }) {
  const people = useQuery(api.users.listAccess, { token: sessionToken });
  const devices = useQuery(api.devices.list, { token: sessionToken });
  const addAllowedEmail = useMutation(api.users.addAllowedEmail);
  const removeAccess = useMutation(api.users.removeAccess);
  const revokeDevice = useMutation(api.devices.revoke);

  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const run = async (task) => {
    setError(null);
    try {
      await task();
    } catch (e) {
      setError(errorMessage(e));
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setBusy(true);
    await run(async () => {
      await addAllowedEmail({ token: sessionToken, email });
      setEmail('');
    });
    setBusy(false);
  };

  return (
    <div className="space-y-8">
      {error && <p className="text-sm text-red-700 bg-red-100 rounded-lg p-3" role="alert">{error}</p>}

      <Section
        icon={<Mail className="h-5 w-5 text-indigo-600" />}
        title="Therapist access"
        description="Only emails on this list can create a therapist account. Add your therapist's email, then have them choose “Create an account” on the sign-in screen."
      >
        <form className="flex flex-col sm:flex-row gap-3" onSubmit={handleAdd}>
          <Input
            type="email" required placeholder="therapist@example.com" className="flex-1"
            value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Therapist email"
          />
          <Button type="submit" disabled={busy}>
            <UserPlus className="h-4 w-4 mr-2" /> Allow email
          </Button>
        </form>

        {!people ? (
          <p className="flex items-center text-sm text-gray-500"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading…</p>
        ) : people.length === 0 ? (
          <p className="text-sm text-gray-500">No therapist emails added yet.</p>
        ) : (
          <ul className="divide-y border rounded-lg">
            {people.map((p) => (
              <li key={p.email} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3">
                <div>
                  <p className="font-medium text-gray-900">{p.name ?? p.email}</p>
                  <p className="text-sm text-gray-500">
                    {p.name && `${p.email} · `}
                    {p.hasAccount ? 'Account active' : 'Waiting for them to create an account'}
                    {p.notOnList && ' · created before the allowlist'}
                  </p>
                </div>
                <RemoveButton
                  label={p.hasAccount ? 'Remove access & delete account' : 'Remove email'}
                  onRemove={() => run(() => removeAccess({ token: sessionToken, email: p.email }))}
                />
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section
        icon={<Tablet className="h-5 w-5 text-indigo-600" />}
        title="Approved devices"
        description="Only these devices can open the games and save Liam's progress. To add one, open the app on it and choose “I'm the parent — approve this device”."
      >
        {!devices ? (
          <p className="flex items-center text-sm text-gray-500"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading…</p>
        ) : devices.length === 0 ? (
          <p className="text-sm text-gray-500">No devices approved yet.</p>
        ) : (
          <ul className="divide-y border rounded-lg">
            {devices.map((d) => (
              <li key={d.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3">
                <div>
                  <p className="font-medium text-gray-900">{d.name}</p>
                  <p className="text-sm text-gray-500">Approved {formatDate(d.approvedAt)} · Last used {formatDate(d.lastSeenAt)}</p>
                </div>
                <RemoveButton
                  label="Remove device"
                  onRemove={() => run(() => revokeDevice({ token: sessionToken, deviceId: d.id }))}
                />
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}
