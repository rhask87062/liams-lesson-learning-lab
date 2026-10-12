import { useEffect, useState } from 'react';
import { useAction, useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

const TOKEN_KEY = 'deviceToken';
// Remembered so an approved tablet can start playing before the server answers (or while offline).
const APPROVED_KEY = 'deviceApproved';

const read = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};
const write = (key, value) => {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // Storage unavailable; approval will be re-checked with the server each load.
  }
};

export function useDeviceApproval() {
  const [deviceToken, setDeviceToken] = useState(() => read(TOKEN_KEY));
  const status = useQuery(api.devices.status, deviceToken ? { deviceToken } : 'skip');
  const approveAction = useAction(api.auth.approveDevice);
  const checkIn = useMutation(api.devices.checkIn);

  useEffect(() => {
    if (!status) return;
    write(APPROVED_KEY, status.approved ? 'true' : null);
    if (status.approved) checkIn({ deviceToken }).catch(() => {});
  }, [status, deviceToken, checkIn]);

  const cachedApproval = read(APPROVED_KEY) === 'true';
  const approved = !!deviceToken && (status ? status.approved : cachedApproval);
  const loading = !!deviceToken && status === undefined && !cachedApproval;

  const approve = async (sessionToken, name) => {
    const { deviceToken: newToken } = await approveAction({ token: sessionToken, name });
    write(TOKEN_KEY, newToken);
    write(APPROVED_KEY, 'true');
    setDeviceToken(newToken);
  };

  return { deviceToken: approved ? deviceToken : null, approved, loading, approve };
}
