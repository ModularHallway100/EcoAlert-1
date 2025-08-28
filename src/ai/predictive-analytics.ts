interface PollutionData {
  timestamp: Date;
  location: string;
  aqi: number;
  pm25: number;
  pm10: number;
  no2: number;
  so2: number;
  co: number;
  o3: number;
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: string;
}

export const predictPollutionLevels = (
  historicalData: PollutionData[],
  timeframe: number
): PollutionData[] => {
  if (historicalData.length < 2) {
    console.warn(
      "Insufficient data for prediction. Provide at least two data points."
    );
    return [];
  }

  // Simple linear regression for AQI prediction
  const n = historicalData.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;

  for (let i = 0; i < n; i++) {
    const x = i; // Time index
    const y = historicalData[i].aqi; // AQI value

    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Predict AQI for the next 'timeframe' data points
  const futureData: PollutionData[] = [];
  for (let i = 1; i <= timeframe; i++) {
    const x = n + i; // Future time index
    const predictedAqi = slope * x + intercept;

    // Create a new PollutionData object with the predicted AQI
    const lastData = historicalData[historicalData.length - 1];
    futureData.push({
      timestamp: new Date(
        lastData.timestamp.getTime() + i * 60 * 60 * 1000
      ), // Assuming 1-hour intervals
      location: lastData.location,
      aqi: Math.max(0, predictedAqi), // Ensure AQI is not negative
      pm25: lastData.pm25,
      pm10: lastData.pm10,
      no2: lastData.no2,
      so2: lastData.so2,
      co: lastData.co,
      o3: lastData.o3,
      temperature: lastData.temperature,
      humidity: lastData.humidity,
      windSpeed: lastData.windSpeed,
      windDirection: lastData.windDirection,
    });
  }

  return futureData;
};