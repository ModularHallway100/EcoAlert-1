"use client";

import { useState, useEffect } from 'react';
import type { AqiData } from '@/lib/types';

const API_KEY = process.env.NEXT_PUBLIC_WAQI_API_KEY;

export function useAqi() {
  const [data, setData] = useState<AqiData>({ aqi: null, dominantPollutant: null });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchAqi = (lat?: number, lon?: number) => {
    const endpoint = lat && lon ? `geo:${lat};${lon}` : 'here';
    setLoading(true);
    setError(null);
    fetch(`https://api.waqi.info/feed/${endpoint}/?token=${API_KEY}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(apiResponse => {
        if (apiResponse.status === "ok") {
          setData({
            aqi: apiResponse.data.aqi,
            dominantPollutant: apiResponse.data.dominentpol,
          });
        } else {
          setError(apiResponse.data || "Could not fetch AQI data.");
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
          console.warn(`Location error: ${err.message}. Fetching for current location.`);
          // Fallback to IP-based location if user denies permission
          fetchAqi();
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
      // Fallback to IP-based location if geolocation is not supported
      fetchAqi();
    }
  }, []);

  return { ...data, error, loading };
}
