import { PollutionData } from '@/lib/types';

export const detectAnomalies = (data: PollutionData[], threshold: number) => {
  if (data.length < 3) {
    return []; // Not enough data to detect anomalies
  }

  const anomalies: PollutionData[] = [];
  const mean = data.reduce((sum, d) => sum + d.aqi, 0) / data.length;
  const stdDev = Math.sqrt(data.reduce((sum, d) => sum + Math.pow(d.aqi - mean, 2), 0) / data.length);

  for (const d of data) {
    const zScore = Math.abs((d.aqi - mean) / stdDev);
    if (zScore > threshold) {
      anomalies.push(d);
    }
  }

  return anomalies;
};