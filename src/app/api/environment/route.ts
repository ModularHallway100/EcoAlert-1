import { NextResponse } from 'next/server';
import type { EnvironmentalData } from '@/lib/types';
import { SIMULATION_CYCLE_TIME, POLLUTANTS } from '@/lib/constants';

// Simulate a wave pattern for a given range
const simulateWave = (min: number, max: number, offset: number = 0): number => {
    const now = Date.now();
    const cycleProgress = ((now + offset) % SIMULATION_CYCLE_TIME) / SIMULATION_CYCLE_TIME; // 0 to 1
    const wave = Math.sin(cycleProgress * Math.PI * 2); // -1 to 1
    const scaledWave = (wave + 1) / 2; // 0 to 1
    const value = min + scaledWave * (max - min);
    return value;
};

// This function simulates fetching data for a given location.
const getSimulatedApiData = (latitude?: number, longitude?: number): EnvironmentalData => {
  // Use coordinates to slightly alter the simulation values for realism
  const locationOffset = latitude && longitude ? (latitude + longitude) * 100 : 0;

  const currentAqi = simulateWave(20, 250, locationOffset);
  const currentPh = simulateWave(5.5, 8.5, locationOffset + 10000);
  const currentTurbidity = simulateWave(1, 60, locationOffset + 20000);
  const currentNoise = simulateWave(40, 100, locationOffset + 30000);

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


export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');

    const latitude = lat ? parseFloat(lat) : undefined;
    const longitude = lon ? parseFloat(lon) : undefined;
    
    const data = getSimulatedApiData(latitude, longitude);

    return NextResponse.json(data);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ message: 'Error fetching environmental data' }, { status: 500 });
  }
}
