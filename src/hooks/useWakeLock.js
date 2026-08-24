import { useEffect, useRef, useState } from 'react';

export function useWakeLock(active) {
  const [supported, setSupported] = useState(false);
  const lockRef = useRef(null);

  useEffect(() => {
    setSupported(typeof navigator !== 'undefined' && 'wakeLock' in navigator);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function acquire() {
      try {
        if (active && typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
          lockRef.current = await navigator.wakeLock.request('screen');
        }
      } catch (e) {
        /* ignore */
      }
    }
    if (active) acquire();
    return () => {
      cancelled = true;
      if (lockRef.current) {
        lockRef.current.release().catch(() => {});
        lockRef.current = null;
      }
    };
  }, [active]);

  useEffect(() => {
    const onVis = async () => {
      if (document.visibilityState === 'visible' && active && typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
        try {
          lockRef.current = await navigator.wakeLock.request('screen');
        } catch (e) {
          /* ignore */
        }
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [active]);

  return supported;
}