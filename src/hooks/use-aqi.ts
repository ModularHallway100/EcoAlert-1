
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

export function useEnvironmentalData() {
  const [data, setData] = useState<EnvironmentalData>({
    aqi: null,
    dominantPollutant: null,
    ph: null,
    turbidity: null,
    noise: null,
  });
  const [error] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const simulateData = () => {
        // Use different offsets to make the waves less synchronized
        const currentAqi = simulateWave(20, 250, 0);
        const currentPh = simulateWave(5.5, 8.5, 10000);
        const currentTurbidity = simulateWave(1, 60, 20000);
        const currentNoise = simulateWave(40, 100, 30000);

        const pollutantIndex = Math.floor((currentAqi / 250) * POLLUTANTS.length) % POLLUTANTS.length;
        const dominantPollutant = POLLUTANTS[pollutantIndex];
        
        setData({
            aqi: Math.round(currentAqi),
            dominantPollutant: dominantPollutant,
            ph: parseFloat(currentPh.toFixed(1)),
            turbidity: Math.round(currentTurbidity),
            noise: Math.round(currentNoise),
        });
        setLoading(false);
    }
    
    simulateData();
    const interval = setInterval(simulateData, SIMULATION_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  return { ...data, error, loading };
}
