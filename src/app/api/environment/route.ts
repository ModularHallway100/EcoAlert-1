import { NextResponse } from 'next/server';
import type { EnvironmentalData } from '@/lib/types';
import { SIMULATION_CYCLE_TIME, POLLUTANTS } from '@/lib/constants';

// --- REAL API INTEGRATION: WAQI (World Air Quality Index) ---
// Fetches live AQI data from the WAQI API for the given coordinates.
// You need to get a free API token from https://aqicn.org/data-platform/token/
// and add it to your .env file as WAQI_API_TOKEN.
const getWaqiApiData = async (latitude: number, longitude: number): Promise<{ aqi: number | null, dominantPollutant: string | null }> => {
  const token = process.env.WAQI_API_TOKEN;
  if (!token) {
    console.warn("WAQI API token not found. Using simulated AQI data. Get a token from https://aqicn.org/data-platform/token/");
    return { aqi: null, dominantPollutant: null };
  }

  const url = `https://api.waqi.info/feed/geo:${latitude};${longitude}/?token=${token}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`WAQI API request failed with status ${response.status}`);
      return { aqi: null, dominantPollutant: null };
    }
    
    const data = await response.json();

    if (data.status !== "ok") {
      console.error(`WAQI API returned an error: ${data.data}`);
      return { aqi: null, dominantPollutant: null };
    }
    
    const aqi = data.data.aqi;
    // The dominant pollutant is often pm2.5, but we can check for others.
    const dominantPollutant = data.data.dominentpol?.toUpperCase() || "N/A";

    return { 
        aqi: typeof aqi === 'number' ? aqi : null, 
        dominantPollutant: dominantPollutant
    };
  } catch (error) {
    console.error("Error fetching data from WAQI API:", error);
    return { aqi: null, dominantPollutant: null };
  }
};


// Simulate a wave pattern for a given range
const simulateWave = (min: number, max: number, offset: number = 0): number => {
    const now = Date.now();
    const cycleProgress = ((now + offset) % SIMULATION_CYCLE_TIME) / SIMULATION_CYCLE_TIME; // 0 to 1
    const wave = Math.sin(cycleProgress * Math.PI * 2); // -1 to 1
    const scaledWave = (wave + 1) / 2; // 0 to 1
    const value = min + scaledWave * (max - min);
    return value;
};

// This function simulates data for metrics NOT provided by the WAQI API.
const getSimulatedSensorData = (latitude?: number, longitude?: number): Partial<EnvironmentalData> => {
  // Use coordinates to slightly alter the simulation values for realism
  const locationOffset = latitude && longitude ? (latitude + longitude) * 100 : 0;

  const currentPh = simulateWave(5.5, 8.5, locationOffset + 10000);
  const currentTurbidity = simulateWave(1, 60, locationOffset + 20000);
  const currentNoise = simulateWave(40, 100, locationOffset + 30000);
    
  return {
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

    const latitude = lat ? parseFloat(lat) : 40.7128; // Default to NYC if no lat
    const longitude = lon ? parseFloat(lon) : -74.0060; // Default to NYC if no lon
    
    // Fetch live AQI data
    const { aqi, dominantPollutant } = await getWaqiApiData(latitude, longitude);

    // Get simulated data for other sensors
    const simulatedData = getSimulatedSensorData(latitude, longitude);

    // If the API call fails or the token is missing, fall back to simulated AQI
    let finalAqi = aqi;
    let finalDominantPollutant = dominantPollutant;

    if (aqi === null) {
      const simulatedAqi = simulateWave(20, 250);
      finalAqi = Math.round(simulatedAqi);
      const pollutantIndex = Math.floor((simulatedAqi / 250) * POLLUTANTS.length) % POLLUTANTS.length;
      finalDominantPollutant = POLLUTANTS[pollutantIndex];
    }
    
    const combinedData: EnvironmentalData = {
      aqi: finalAqi,
      dominantPollutant: finalDominantPollutant,
      ph: simulatedData.ph!,
      turbidity: simulatedData.turbidity!,
      noise: simulatedData.noise!,
    };

    return NextResponse.json(combinedData);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ message: 'Error fetching environmental data' }, { status: 500 });
  }
}
