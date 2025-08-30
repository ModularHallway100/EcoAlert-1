import { useState, useEffect, useCallback } from 'react';
import type { PollutionDataPoint, PollutionHistory, MapSettings } from '@/lib/pollution-types';

interface UsePollutionHeatmapReturn {
  pollutionData: PollutionDataPoint[];
  historyData: PollutionHistory[];
  mapSettings: MapSettings;
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  updateMapSettings: (settings: Partial<MapSettings>) => void;
  exportData: () => void;
  fetchPollutionData: (center: { latitude: number; longitude: number }, radius?: number, count?: number) => Promise<void>;
}

const generateMockHistory = (): PollutionHistory[] => {
  const history: PollutionHistory[] = [];
  const now = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    const avgAQI = 60 + Math.sin(i / 3) * 30 + (Math.random() - 0.5) * 20;
    const maxAQI = avgAQI + 40 + Math.random() * 30;
    const minAQI = Math.max(20, avgAQI - 30 - Math.random() * 20);
    
    // Generate random data points for the day
    const dataPoints: PollutionDataPoint[] = [];
    for (let j = 0; j < 24; j++) {
      const hour = new Date(date);
      hour.setHours(j, 0, 0, 0);
      
      dataPoints.push({
        id: `day-${i}-hour-${j}`,
        location: { 
          latitude: 40.7128 + (Math.random() - 0.5) * 0.1, 
          longitude: -74.0060 + (Math.random() - 0.5) * 0.1 
        },
        aqi: Math.round(avgAQI + Math.sin(j / 3) * 20 + (Math.random() - 0.5) * 15),
        pm25: Math.round(avgAQI * 0.7 + (Math.random() - 0.5) * 10),
        pm10: Math.round(avgAQI * 0.9 + (Math.random() - 0.5) * 15),
        o3: Math.round(avgAQI * 0.5 + (Math.random() - 0.5) * 20),
        no2: Math.round(avgAQI * 0.6 + (Math.random() - 0.5) * 15),
        so2: Math.round(avgAQI * 0.2 + (Math.random() - 0.5) * 10),
        co: Math.round(avgAQI * 0.3 + (Math.random() - 0.5) * 15),
        timestamp: hour.toISOString(),
        source: 'simulated'
      });
    }
    
    // Determine dominant pollutant
    const pollutants = ['PM2.5', 'PM10', 'O3', 'NO2', 'SO2', 'CO'];
    const weights = dataPoints.map(p => 
      p.pm25 + p.pm10 + p.o3 + p.no2 + p.so2 + p.co
    );
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    const dominantIndex = weights.reduce((maxIndex, weight, index, arr) => 
      weight > arr[maxIndex] ? index : maxIndex, 0
    );
    
    history.push({
      date: date.toISOString().split('T')[0],
      dataPoints,
      summary: {
        averageAQI: Math.round(avgAQI),
        maxAQI: Math.round(maxAQI),
        minAQI: Math.round(minAQI),
        dominantPollutant: pollutants[dominantIndex]
      }
    });
  }
  
  return history;
};

export const usePollutionHeatmap = (): UsePollutionHeatmapReturn => {
  const [pollutionData, setPollutionData] = useState<PollutionDataPoint[]>([]);
  const [historyData, setHistoryData] = useState<PollutionHistory[]>([]);
  const [mapSettings, setMapSettings] = useState<MapSettings>({
    center: { latitude: 40.7128, longitude: -74.0060 },
    zoom: 11,
    minZoom: 3,
    maxZoom: 18,
    heatMapEnabled: true,
    markersEnabled: true,
    realTimeUpdates: true,
    updateInterval: 30000
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize data
  useEffect(() => {
    setIsLoading(true);
    
    // Simulate API calls
    setTimeout(() => {
      setHistoryData(generateMockHistory());
      setIsLoading(false);
    }, 1000);
  }, []);

  const fetchPollutionData = useCallback(async (
    center: { latitude: number; longitude: number }, 
    radius = 10000, 
    count = 100
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Generate mock pollution data
      const data: PollutionDataPoint[] = [];
      const baseLocation = center;
      
      for (let i = 0; i < count; i++) {
        // Generate random points within the radius
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * radius;
        
        const latitude = baseLocation.latitude + (distance / 111000) * Math.cos(angle);
        const longitude = baseLocation.longitude + (distance / 111000) * Math.sin(angle);
        
        // Base AQI with location-based variation
        const baseAQI = 60 + Math.sin(latitude * 10) * 30 + Math.cos(longitude * 10) * 20;
        const aqi = Math.max(10, Math.min(500, baseAQI + (Math.random() - 0.5) * 40));
        
        data.push({
          id: `point-${i}-${Date.now()}`,
          location: { latitude, longitude },
          aqi: Math.round(aqi),
          pm25: Math.round(aqi * 0.7 + (Math.random() - 0.5) * 20),
          pm10: Math.round(aqi * 0.9 + (Math.random() - 0.5) * 30),
          o3: Math.round(aqi * 0.5 + (Math.random() - 0.5) * 40),
          no2: Math.round(aqi * 0.6 + (Math.random() - 0.5) * 30),
          so2: Math.round(aqi * 0.2 + (Math.random() - 0.5) * 15),
          co: Math.round(aqi * 0.3 + (Math.random() - 0.5) * 25),
          timestamp: new Date().toISOString(),
          source: 'simulated'
        });
      }
      
      // Add some hotspots
      for (let i = 0; i < 3; i++) {
        const hotspotLat = baseLocation.latitude + (Math.random() - 0.5) * 0.02;
        const hotspotLng = baseLocation.longitude + (Math.random() - 0.5) * 0.02;
        const hotspotAQI = 200 + Math.random() * 100;
        
        data.push({
          id: `hotspot-${i}-${Date.now()}`,
          location: { latitude: hotspotLat, longitude: hotspotLng },
          aqi: Math.round(hotspotAQI),
          pm25: Math.round(hotspotAQI * 0.8 + (Math.random() - 0.5) * 30),
          pm10: Math.round(hotspotAQI * 1.0 + (Math.random() - 0.5) * 40),
          o3: Math.round(hotspotAQI * 0.6 + (Math.random() - 0.5) * 50),
          no2: Math.round(hotspotAQI * 0.7 + (Math.random() - 0.5) * 40),
          so2: Math.round(hotspotAQI * 0.3 + (Math.random() - 0.5) * 20),
          co: Math.round(hotspotAQI * 0.4 + (Math.random() - 0.5) * 30),
          timestamp: new Date().toISOString(),
          source: 'simulated'
        });
      }
      
      setPollutionData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch pollution data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshData = useCallback(async () => {
    await fetchPollutionData(mapSettings.center);
  }, [fetchPollutionData, mapSettings.center]);

  const updateMapSettings = useCallback((settings: Partial<MapSettings>) => {
    setMapSettings(prev => ({ ...prev, ...settings }));
  }, []);

  const exportData = useCallback(() => {
    const dataStr = JSON.stringify({
      pollutionData,
      historyData,
      mapSettings,
      exportDate: new Date().toISOString()
    }, null, 2);
    
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pollution-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [pollutionData, historyData, mapSettings]);

  return {
    pollutionData,
    historyData,
    mapSettings,
    isLoading,
    error,
    refreshData,
    updateMapSettings,
    exportData,
    fetchPollutionData
  };
};