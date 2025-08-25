
"use client";

import { useState, useEffect } from 'react';
import type { EnvironmentalData } from '@/lib/types';
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

const getSimulatedData = (): EnvironmentalData => {
    // Use different offsets to make the waves less synchronized
    const currentAqi = simulateWave(20, 250, 0);
    const currentPh = simulateWave(5.5, 8.5, 10000);
    const currentTurbidity = simulateWave(1, 60, 20000);
    const currentNoise = simulateWave(40, 100, 30000);

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
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // --- REAL API INTEGRATION POINT ---
        // To integrate a real API, you would replace the simulation logic below
        // with a fetch call to your data source.
        // 
        // Example:
        // const response = await fetch('https://api.yourenvironmentalservice.com/data?location=YOUR_LOCATION');
        // if (!response.ok) {
        //   throw new Error('Failed to fetch data');
        // }
        // const realData = await response.json();
        // setData({
        //   aqi: realData.aqi,
        //   dominantPollutant: realData.dominantPollutant,
        //   ph: realData.water.ph,
        //   turbidity: realData.water.turbidity,
        //   noise: realData.noise.level,
        // });

        // For now, we'll use the simulation as a fallback.
        // To switch to real data, comment out or remove the simulation part.
        const simulatedData = getSimulatedData();
        setData(simulatedData);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        // Keep showing simulated data on error so the UI doesn't break
        setData(getSimulatedData());
      } finally {
        setLoading(false);
      }
    };
    
    // Initial fetch
    fetchData();

    // Set up an interval to refetch data or update the simulation
    const interval = setInterval(fetchData, SIMULATION_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  return { ...data, error, loading };
}
