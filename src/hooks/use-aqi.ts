"use client";

import { useState, useEffect } from 'react';
import type { AqiData } from '@/lib/types';

const POLLUTANTS = ["PM2.5", "O3", "NO2", "SO2", "CO"];
const SIMULATION_CYCLE_TIME = 60 * 1000; // 60 seconds for a full cycle
const SIMULATION_INTERVAL = 5000; // 5 seconds

// Simulate a wave pattern for AQI
const generateAqiValue = (): number => {
    const now = Date.now();
    const cycleProgress = (now % SIMULATION_CYCLE_TIME) / SIMULATION_CYCLE_TIME; // 0 to 1
    
    // Use a sine wave to create a smooth, repeating pattern from 0 to 1 and back to 0
    const wave = Math.sin(cycleProgress * Math.PI * 2); // -1 to 1
    
    // Scale and shift the wave to map to the AQI range (e.g., 20 to 450)
    const scaledWave = (wave + 1) / 2; // 0 to 1
    const aqi = 20 + scaledWave * 430; // 20 to 450
    
    return Math.round(aqi);
};

export function useAqi() {
  const [data, setData] = useState<AqiData>({ aqi: null, dominantPollutant: null });
  const [error] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const simulateAqi = () => {
        const currentAqi = generateAqiValue();
        const dominantPollutant = POLLUTANTS[Math.floor(Math.random() * POLLUTANTS.length)];
        
        setData({
            aqi: currentAqi,
            dominantPollutant: dominantPollutant,
        });
        setLoading(false);
    }
    
    // Initial value
    simulateAqi();
    
    const interval = setInterval(simulateAqi, SIMULATION_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  return { ...data, error, loading };
}
