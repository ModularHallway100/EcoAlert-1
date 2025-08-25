
"use client";

import { useState, useEffect } from 'react';
import type { EnvironmentalData, Coordinates } from '@/lib/types';
import { SIMULATION_CYCLE_TIME, SIMULATION_INTERVAL, POLLUTANTS } from '@/lib/constants';

// Simulate a wave pattern for a given range
const simulateWave = (min: number, max: number, offset: number = 0): number => {
    const now = Date.now();
    const cycleProgress = ((now + offset) % SIMULATION_CYCLE_TIME) / SIMULATION_CYCLE_TIME; // 0 to 1
    const wave = Math.sin(cycleProgress * Math.PI * 2); // -1 to 1
    const scaledWave = (wave + 1) / 2; // 0 to 1
    const value = min + scaledWave * (max - min);
    return value;
};

// This function simulates fetching data from a remote API for a given location.
const getSimulatedApiData = async (coordinates: Coordinates | null): Promise<EnvironmentalData> => {
  console.log('Fetching simulated data for coordinates:', coordinates);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // --- REAL API INTEGRATION POINT ---
  // To integrate a real API, you would replace this simulation logic
  // with a fetch call to your data source, passing the coordinates.
  // 
  // Example:
  // if (!coordinates) throw new Error("Location not available");
  // const { latitude, longitude } = coordinates;
  // const response = await fetch(`https://api.yourenvironmentalservice.com/data?lat=${latitude}&lon=${longitude}`);
  // if (!response.ok) {
  //   throw new Error('Failed to fetch data');
  // }
  // const realData = await response.json();
  // return {
  //   aqi: realData.aqi,
  //   dominantPollutant: realData.dominantPollutant,
  //   ph: realData.water.ph,
  //   turbidity: realData.water.turbidity,
  //   noise: realData.noise.level,
  // };

  // For now, we'll use the simulation as a fallback.
  // The simulation can be made more realistic by using coordinates to slightly alter the values.
  const aqiOffset = coordinates ? (coordinates.latitude + coordinates.longitude) * 100 : 0;
  const currentAqi = simulateWave(20, 250, aqiOffset);
  const currentPh = simulateWave(5.5, 8.5, aqiOffset + 10000);
  const currentTurbidity = simulateWave(1, 60, aqiOffset + 20000);
  const currentNoise = simulateWave(40, 100, aqiOffset + 30000);

  const pollutantIndex = Math.floor((currentAqi / 250) * POLLUTANTS.length) % POLLUTANTS.length;
  const dominantPollutant = POLLUTANTS[pollutantIndex];
    
  return {
    aqi: Math.round(currentAqi),
    dominantPollutant: dominantPollutant,
    ph: parseFloat(currentPh.toFixed(1)),
    turbidity: Math.round(currentTurbidity),
    noise: Math.round(currentNoise),
  };
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
          // Set a default location if permission is denied, so the app can still function
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
        const result = await getSimulatedApiData(coordinates);
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
