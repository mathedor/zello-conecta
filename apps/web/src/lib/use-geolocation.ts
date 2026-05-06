'use client';

import { useEffect, useState } from 'react';

interface GeoState {
  status: 'idle' | 'loading' | 'denied' | 'error' | 'ready';
  city?: string;
  state?: string;
  lat?: number;
  lng?: number;
}

const STORAGE_KEY = 'zello.geo.v1';
const TTL_MS = 60 * 60 * 1000;

interface CachedGeo {
  city: string;
  state: string;
  lat: number;
  lng: number;
  ts: number;
}

export function useGeolocation(): GeoState {
  const [state, setState] = useState<GeoState>({ status: 'idle' });

  useEffect(() => {
    let cancelled = false;

    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as CachedGeo;
        if (Date.now() - parsed.ts < TTL_MS) {
          setState({
            status: 'ready',
            city: parsed.city,
            state: parsed.state,
            lat: parsed.lat,
            lng: parsed.lng,
          });
          return;
        }
      }
    } catch {
      // ignore cache errors
    }

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setState({ status: 'error' });
      return;
    }

    setState({ status: 'loading' });

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=pt`,
            { cache: 'force-cache' },
          );
          const data = (await res.json()) as {
            city?: string;
            locality?: string;
            principalSubdivisionCode?: string;
            principalSubdivision?: string;
          };
          const city = data.city || data.locality || '';
          const stateCode = data.principalSubdivisionCode?.replace(/^BR-?/i, '') ?? '';
          if (cancelled) return;
          if (city) {
            const cache: CachedGeo = {
              city,
              state: stateCode,
              lat: latitude,
              lng: longitude,
              ts: Date.now(),
            };
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
            } catch {
              // ignore
            }
            setState({ status: 'ready', city, state: stateCode, lat: latitude, lng: longitude });
          } else {
            setState({ status: 'error', lat: latitude, lng: longitude });
          }
        } catch {
          if (!cancelled) setState({ status: 'error', lat: latitude, lng: longitude });
        }
      },
      (err) => {
        if (cancelled) return;
        setState({ status: err.code === err.PERMISSION_DENIED ? 'denied' : 'error' });
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60_000 },
    );

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
