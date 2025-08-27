import { NextResponse } from 'next/server';
import type { EnvironmentalData } from '@/lib/types';
import { SIMULATION_CYCLE_TIME, POLLUTANTS } from '@/lib/constants';

// --- REAL API INTEGRATION: WAQI (World Air Quality Index) ---
// Fetches live AQI data from the WAQI API for the given coordinates.
// You need to get a free API token from https://aqicn.org/data-platform/token/
// and add it to your .env file as WAQI_API_TOKEN.
const getWaqiApiData = async (latitude: number, longitude: number): Promise<{ aqi: number | null, dominantPollutant: string | null }> => {
  const token = process.env.WAQI_API_TOKEN;
  if (!token || token === 'YOUR_WAQI_API_TOKEN_HERE') {
    console.warn("WAQI_API_TOKEN is not set. Using simulated AQI data. Get a token from https://aqicn.org/data-platform/token/");
    return { aqi: null, dominantPollutant: null };
  }

  const url = `https://api.waqi.info/feed/geo:${latitude};${longitude}/?token=${token}`;
  
  try {
    const response = await fetch(url, { next: { revalidate: 600 } }); // Cache for 10 minutes
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


// Simulate a wave pattern for a given range with more realistic variations
const simulateWave = (min: number, max: number, offset: number = 0): number => {
    const now = Date.now();
    const cycleProgress = ((now + offset) % SIMULATION_CYCLE_TIME) / SIMULATION_CYCLE_TIME; // 0 to 1
    const wave = Math.sin(cycleProgress * Math.PI * 2); // -1 to 1
    const scaledWave = (wave + 1) / 2; // 0 to 1
    
    // Add some random variation for realism
    const randomFactor = 0.9 + Math.random() * 0.2; // 0.9 to 1.1
    const value = min + scaledWave * (max - min) * randomFactor;
    
    // Ensure value stays within bounds
    return Math.max(min, Math.min(max, value));
};

// Simulate more realistic daily patterns
const simulateDailyPattern = (min: number, max: number, hourOffset: number = 0): number => {
    const now = Date.now();
    const hour = ((now / (1000 * 60 * 60)) + hourOffset) % 24; // Current hour (0-23)
    
    // Create a realistic daily pattern (e.g., higher pollution during rush hours)
    const dailyPattern = Math.sin((hour - 6) * Math.PI / 12); // Peak at 6 PM
    const normalizedPattern = (dailyPattern + 1) / 2; // 0 to 1
    
    // Add some random variation
    const randomFactor = 0.9 + Math.random() * 0.2;
    const value = min + normalizedPattern * (max - min) * randomFactor;
    
    return Math.max(min, Math.min(max, value));
};

// This function simulates data for metrics NOT provided by the WAQI API.
const getSimulatedSensorData = (latitude?: number, longitude?: number): Partial<EnvironmentalData> => {
  // Use coordinates to slightly alter the simulation values for realism
  const locationOffset = latitude && longitude ? (latitude + longitude) * 100 : 0;

  // Water pH should be relatively stable with small variations
  const currentPh = simulateWave(6.8, 7.4, locationOffset + 10000);
  
  // Turbidity can vary more, especially after rain or in windy conditions
  const currentTurbidity = simulateDailyPattern(5, 45, locationOffset + 20000);
  
  // Noise levels follow daily patterns (higher during day, lower at night)
  const currentNoise = simulateDailyPattern(45, 85, locationOffset + 30000);
    
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
      // Simulate more realistic AQI patterns based on time of day
      const simulatedAqi = simulateDailyPattern(30, 180);
      finalAqi = Math.round(simulatedAqi);
      
      // Choose dominant pollutant based on AQI level
      let pollutantIndex;
      if (simulatedAqi < 50) pollutantIndex = 0; // PM2.5
      else if (simulatedAqi < 100) pollutantIndex = Math.floor(Math.random() * 2); // PM2.5 or O3
      else if (simulatedAqi < 150) pollutantIndex = Math.floor(Math.random() * 3); // PM2.5, O3, or NO2
      else pollutantIndex = Math.floor(Math.random() * POLLUTANTS.length); // Any pollutant
      
      finalDominantPollutant = POLLUTANTS[pollutantIndex];
    }
    
    const combinedData: EnvironmentalData = {
      aqi: finalAqi,
      dominantPollutant: finalDominantPollutant,
      ph: simulatedData.ph!,
      turbidity: simulatedData.turbidity!,
      noise: simulatedData.noise!,
    };
    
    return NextResponse.json(combinedData, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=300',
      }
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ message: 'Error fetching environmental data' }, { status: 500 });
  }
}
