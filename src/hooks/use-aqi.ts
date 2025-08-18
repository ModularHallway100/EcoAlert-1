"use client";

import { useState, useEffect } from 'react';

const API_KEY = process.env.NEXT_PUBLIC_WAQI_API_KEY;

export function useAqi() {
  const [aqi, setAqi] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchAqi = (lat: number, lon: number) => {
    setLoading(true);
    setError(null);
    fetch(`https://api.waqi.info/feed/geo:${lat};${lon}/?token=${API_KEY}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        if (data.status === "ok") {
          setAqi(data.data.aqi);
        } else {
          setError(data.data || "Could not fetch AQI data.");
        }
      })
      .catch(err => {
        console.error("Fetch error:", err);
        setError("Failed to fetch AQI data. Please ensure location services are enabled and try again.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchAqi(latitude, longitude);

          const interval = setInterval(() => {
            fetchAqi(latitude, longitude);
          }, 300000); // Refresh every 5 minutes

          return () => clearInterval(interval);
        },
        (err) => {
          setError(`Location error: ${err.message}. Please enable location services.`);
          setLoading(false);
          // Fallback to a default location if user denies permission
          fetchAqi(40.7128, -74.0060); // New York
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
      // Fallback to a default location if geolocation is not supported
      fetchAqi(40.7128, -74.0060); // New York
    }
  }, []);

  return { aqi, error, loading };
}
