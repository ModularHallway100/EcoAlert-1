"use client";

import { useState, useEffect } from 'react';
import type { AqiData } from '@/lib/types';

const POLLUTANTS = ["PM2.5", "O3", "NO2", "SO2", "CO"];

// Function to generate a random AQI value that drifts over time
const generateAqiValue = (previousAqi: number | null): number => {
  if (previousAqi === null) {
    return Math.floor(Math.random() * 50) + 1; // Start with a "Good" value
  }
  
  // Create a gentle drift, with occasional larger jumps
  const drift = (Math.random() - 0.45) * 25; 
  let nextAqi = previousAqi + drift;

  // Clamp the value between 1 and 450
  nextAqi = Math.max(1, Math.min(nextAqi, 450));

  return Math.round(nextAqi);
};


export function useAqi() {
  const [data, setData] = useState<AqiData>({ aqi: null, dominantPollutant: null });
  const [error] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let currentAqi: number | null = null;
    
    const simulateAqi = () => {
        setLoading(true);
        currentAqi = generateAqiValue(currentAqi);
        const dominantPollutant = POLLUTANTS[Math.floor(Math.random() * POLLUTANTS.length)];
        
        setData({
            aqi: currentAqi,
            dominantPollutant: dominantPollutant,
        });
        setLoading(false);
    }
    
    // Initial value
    simulateAqi();
    
    const interval = setInterval(simulateAqi, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return { ...data, error, loading };
}
