import type { Coordinates } from './types';

export interface PollutionDataPoint {
  id: string;
  location: Coordinates;
  aqi: number;
  pm25: number;
  pm10: number;
  o3: number;
  no2: number;
  so2: number;
  co: number;
  timestamp: string;
  source: 'sensor' | 'waqi' | 'simulated';
}

export interface PollutionHeatmapLayer {
  id: string;
  name: string;
  type: 'aqi' | 'pm25' | 'pm10' | 'o3' | 'no2' | 'so2' | 'co';
  visible: boolean;
  opacity: number;
  colorScale: string[];
  bounds: [number, number, number, number]; // [south, west, north, east]
}

export interface PollutionZone {
  id: string;
  name: string;
  type: 'safe' | 'moderate' | 'unhealthy' | 'very-unhealthy' | 'hazardous';
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  center: Coordinates;
  radius: number; // in meters
  averageAQI: number;
  population: number;
}

export interface MapSettings {
  center: Coordinates;
  zoom: number;
  minZoom: number;
  maxZoom: number;
  heatMapEnabled: boolean;
  markersEnabled: boolean;
  realTimeUpdates: boolean;
  updateInterval: number; // in milliseconds
}

export interface PollutionAlert {
  id: string;
  type: 'air' | 'water' | 'noise';
  severity: 'low' | 'moderate' | 'high' | 'critical';
  title: string;
  message: string;
  location: Coordinates;
  radius: number;
  aqi?: number;
  timestamp: string;
  expiresAt: string;
  source: 'system' | 'user' | 'ai';
}

export interface PollutionHistory {
  date: string;
  dataPoints: PollutionDataPoint[];
  summary: {
    averageAQI: number;
    maxAQI: number;
    minAQI: number;
    dominantPollutant: string;
  };
}

export interface MapLegend {
  type: string;
  label: string;
  color: string;
  min: number;
  max: number;
}

export const POLLUTION_LEGENDS: MapLegend[] = [
  {
    type: 'aqi',
    label: 'Good',
    color: '#22c55e',
    min: 0,
    max: 50
  },
  {
    type: 'aqi',
    label: 'Moderate',
    color: '#facc15',
    min: 51,
    max: 100
  },
  {
    type: 'aqi',
    label: 'Unhealthy for Sensitive Groups',
    color: '#f97316',
    min: 101,
    max: 150
  },
  {
    type: 'aqi',
    label: 'Unhealthy',
    color: '#ef4444',
    min: 151,
    max: 200
  },
  {
    type: 'aqi',
    label: 'Very Unhealthy',
    color: '#a855f7',
    min: 201,
    max: 300
  },
  {
    type: 'aqi',
    label: 'Hazardous',
    color: '#881337',
    min: 301,
    max: 500
  }
];

export const DEFAULT_MAP_SETTINGS: MapSettings = {
  center: { latitude: 40.7128, longitude: -74.0060 }, // New York City
  zoom: 11,
  minZoom: 3,
  maxZoom: 18,
  heatMapEnabled: true,
  markersEnabled: true,
  realTimeUpdates: true,
  updateInterval: 30000 // 30 seconds
};

export const POLLUTANT_COLORS: Record<string, string[]> = {
  aqi: ['#22c55e', '#facc15', '#f97316', '#ef4444', '#a855f7', '#881337'],
  pm25: ['#e3f2fd', '#90caf9', '#42a5f5', '#2196f3', '#1976d2', '#0d47a1'],
  pm10: ['#e8f5e9', '#a5d6a7', '#66bb6a', '#4caf50', '#388e3c', '#1b5e20'],
  o3: ['#fff3e0', '#ffe0b2', '#ffcc80', '#ffb74d', '#ffa726', '#f57c00'],
  no2: ['#fce4ec', '#f8bbd0', '#f48fb1', '#f06292', '#ec407a', '#d81b60'],
  so2: ['#f3e5f5', '#e1bee7', '#ce93d8', '#ba68c8', '#ab47bc', '#8e24aa'],
  co: ['#e0f2f1', '#b2dfdb', '#80cbc4', '#4db6ac', '#26a69a', '#00695c']
};