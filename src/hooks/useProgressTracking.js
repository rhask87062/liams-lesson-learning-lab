import { useCallback, useMemo, useRef } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

const IDLE_SESSION_GAP_MS = 20 * 60 * 1000;

// Records Liam's activity to Convex so every approved device feeds one shared history.
export function useProgressTracking(deviceToken) {
  const recordMutation = useMutation(api.progress.record);
  const session = useRef({ mode: null, key: null, lastAt: 0 });

  const startNewSession = useCallback(() => {
    session.current = { mode: null, key: null, lastAt: 0 };
  }, []);

  // isCorrect: true/false for scored answers, undefined for "looked at a word" (Learn Mode, Letter Learner).
  const record = useCallback((mode, word, isCorrect) => {
    if (!deviceToken || !word) return;
    const now = Date.now();
    const s = session.current;
    if (s.mode !== mode || !s.key || now - s.lastAt > IDLE_SESSION_GAP_MS) {
      session.current = { mode, key: crypto.randomUUID(), lastAt: now };
    } else {
      s.lastAt = now;
    }
    recordMutation({
      deviceToken,
      sessionKey: session.current.key,
      mode,
      word: String(word),
      ...(isCorrect === undefined ? {} : { isCorrect: !!isCorrect }),
    }).catch((error) => console.error('Failed to save progress:', error));
  }, [deviceToken, recordMutation]);

  return useMemo(() => ({ record, startNewSession }), [record, startNewSession]);
}
