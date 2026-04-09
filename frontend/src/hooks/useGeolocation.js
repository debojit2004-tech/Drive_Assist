import { useState, useEffect, useCallback, useRef } from 'react';

export function useGeolocation() {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [permissionState, setPermissionState] = useState('prompt');
  const watchIdRef = useRef(null);

  // Check permission state
  useEffect(() => {
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then(result => {
        setPermissionState(result.state);
        result.onchange = () => setPermissionState(result.state);
      }).catch(() => {});
    }
  }, []);

  const updatePosition = useCallback((pos) => {
    const loc = {
      lat: pos.coords.latitude,
      lon: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
      speed: pos.coords.speed,
      heading: pos.coords.heading,
      timestamp: pos.timestamp,
    };
    setPosition(loc);
    setLoading(false);
    setError(null);

    // Sync to backend
    fetch('/api/location', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat: loc.lat, lon: loc.lon }),
    }).catch(() => {});
  }, []);

  const startWatching = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    setLoading(true);
    setError(null);

    // First try getCurrentPosition for fast initial fix
    navigator.geolocation.getCurrentPosition(
      updatePosition,
      () => {},
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 60000 }
    );

    // Then watch for continuous updates
    watchIdRef.current = navigator.geolocation.watchPosition(
      updatePosition,
      (err) => {
        console.warn('[GPS]', err.message);
        setLoading(false);

        if (err.code === 1) {
          setError('Location permission denied. Please enable location in your browser settings.');
          setPermissionState('denied');
        } else if (err.code === 2) {
          setError('Location unavailable. Make sure Location is enabled in Windows Settings > Privacy > Location.');
        } else if (err.code === 3) {
          setError('Location request timed out.');
        }

        // If no position yet from GPS, try IP fallback
        if (!position) {
          fetchIPLocation();
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 30000,
      }
    );
  }, [updatePosition]);

  // IP-based fallback
  const fetchIPLocation = useCallback(async () => {
    try {
      // Try multiple IP geolocation services
      const services = [
        { url: 'https://ipwho.is/', parse: (d) => ({ lat: d.latitude, lon: d.longitude, city: d.city, region: d.region, country: d.country }) },
        { url: 'https://ip-api.com/json/?fields=lat,lon,city,regionName,country', parse: (d) => ({ lat: d.lat, lon: d.lon, city: d.city, region: d.regionName, country: d.country }) },
      ];

      for (const service of services) {
        try {
          const res = await fetch(service.url);
          if (res.ok) {
            const data = await res.json();
            const parsed = service.parse(data);
            if (parsed.lat && parsed.lon) {
              setPosition({
                lat: parsed.lat,
                lon: parsed.lon,
                accuracy: 5000,
                speed: null,
                heading: null,
                source: 'ip',
                city: parsed.city,
                region: parsed.region,
                country: parsed.country,
              });
              setLoading(false);
              return;
            }
          }
        } catch { continue; }
      }

      // Final fallback: New Delhi
      setPosition({ lat: 28.6139, lon: 77.2090, accuracy: 0, speed: null, heading: null, source: 'default' });
      setLoading(false);
    } catch {
      setPosition({ lat: 28.6139, lon: 77.2090, accuracy: 0, speed: null, heading: null, source: 'default' });
      setLoading(false);
    }
  }, []);

  // Auto-start on mount
  useEffect(() => {
    startWatching();
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [startWatching]);

  const requestPermission = useCallback(() => {
    startWatching();
  }, [startWatching]);

  const sendLocation = useCallback(async (lat, lon) => {
    try {
      const res = await fetch('/api/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lon }),
      });
      return await res.json();
    } catch {
      return null;
    }
  }, []);

  return { position, error, loading, permissionState, requestPermission, sendLocation };
}
