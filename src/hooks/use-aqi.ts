
"use client";

import { useState, useEffect } from 'react';
import type { EnvironmentalData, Coordinates } from '@/lib/types';
import { SIMULATION_INTERVAL } from '@/lib/constants';

// This function now fetches data from the Next.js API route.
const getEnvironmentalApiData = async (coordinates: Coordinates | null): Promise<EnvironmentalData> => {
  // --- REAL API INTEGRATION POINT ---
  // To integrate a real API, you would replace this URL with your data source.
  // You might need to add an API key to the headers or query parameters.
  // 
  // Example with API Key:
  // const API_KEY = process.env.NEXT_PUBLIC_YOUR_API_KEY;
  // const url = `https://api.yourenvironmentalservice.com/data?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;
  
  let url = '/api/environment';
  if (coordinates) {
    url += `?lat=${coordinates.latitude}&lon=${coordinates.longitude}`;
  }

  const response = await fetch(url);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch environmental data');
  }

  const data: EnvironmentalData = await response.json();
  return data;
}

export function useEnvironmentalData() {
  const [data, setData] = useState<EnvironmentalData>({
    aqi: null,
    dominantPollutant: null,
    ph: null,
    turbidity: null,
    noise: null,
  });
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (geoError) => {
          setError(`Geolocation error: ${geoError.message}. Using default values.`);
          setCoordinates({ latitude: 40.7128, longitude: -74.0060 }); 
        }
      );
    } else {
      setError("Geolocation is not supported by this browser. Using default values.");
      setCoordinates({ latitude: 40.7128, longitude: -74.0060 });
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      // Don't fetch until we have coordinates
      if (!coordinates) return;

      setLoading(true);
      setError(null);

      try {
        const result = await getEnvironmentalApiData(coordinates);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    // Initial fetch once coordinates are available
    fetchData();

    // Set up an interval to refetch data
    const interval = setInterval(fetchData, SIMULATION_INTERVAL);

    return () => clearInterval(interval);
  }, [coordinates]); // Re-run the effect if coordinates change

  return { ...data, coordinates, error, loading };
}
