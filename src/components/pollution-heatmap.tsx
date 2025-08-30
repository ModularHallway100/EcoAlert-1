"use client";

import { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import { Icon, LatLngExpression, LatLngBoundsExpression } from 'leaflet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  AlertTriangle, 
  MapPin, 
  Thermometer, 
  Wind, 
  Droplets, 
  Volume2,
  RefreshCw,
  Eye,
  EyeOff,
  Download,
  Filter,
  Search,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Play,
  Pause
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTrackFeature } from '@/components/analytics-provider';
import { 
  PollutionDataPoint, 
  DEFAULT_MAP_SETTINGS, 
  POLLUTION_LEGENDS,
  POLLUTANT_COLORS,
  MapSettings 
} from '@/lib/pollution-types';
import 'leaflet/dist/leaflet.css';
import '@/styles/leaflet.css';

interface PollutionHeatmapProps {
  className?: string;
  height?: string;
  width?: string;
  data?: PollutionDataPoint[];
  onLocationSelect?: (location: { latitude: number; longitude: number }) => void;
  onPollutionDataSelect?: (data: PollutionDataPoint) => void;
}

// Custom pollution marker icons based on AQI level
const createPollutionMarkerIcon = (aqi: number) => {
  let color = '#22c55e'; // Good - Green
  if (aqi > 50 && aqi <= 100) color = '#facc15'; // Moderate - Yellow
  else if (aqi > 100 && aqi <= 150) color = '#f97316'; // Unhealthy for Sensitive Groups - Orange
  else if (aqi > 150 && aqi <= 200) color = '#ef4444'; // Unhealthy - Red
  else if (aqi > 200 && aqi <= 300) color = '#a855f7'; // Very Unhealthy - Purple
  else if (aqi > 300) color = '#881337'; // Hazardous - Dark Red

  return new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 25" width="25" height="25">
        <circle cx="12.5" cy="12.5" r="10" fill="${color}" stroke="white" stroke-width="2"/>
        <text x="12.5" y="17" text-anchor="middle" fill="white" font-size="10" font-weight="bold">${aqi}</text>
      </svg>
    `)}`,
    iconSize: [25, 25],
    iconAnchor: [12.5, 12.5],
    popupAnchor: [0, -12.5],
  });
};

// Generate mock pollution data for demonstration
const generateMockPollutionData = (): PollutionDataPoint[] => {
  const data: PollutionDataPoint[] = [];
  const baseLocation = { latitude: 40.7128, longitude: -74.0060 }; // NYC
  
  // Generate data points in a grid pattern around NYC
  for (let lat = 40.65; lat <= 40.78; lat += 0.02) {
    for (let lng = -74.08; lng <= -73.93; lng += 0.02) {
      // Add some randomness to create varying pollution levels
      const aqiVariation = Math.sin(lat * 10) * 50 + Math.cos(lng * 10) * 30;
      const aqi = Math.max(10, Math.min(250, 80 + aqiVariation + (Math.random() - 0.5) * 40));
      
      data.push({
        id: `${lat}-${lng}-${Date.now()}`,
        location: { latitude: lat, longitude: lng },
        aqi: Math.round(aqi),
        pm25: Math.round(aqi * 0.7 + (Math.random() - 0.5) * 10),
        pm10: Math.round(aqi * 0.9 + (Math.random() - 0.5) * 15),
        o3: Math.round(aqi * 0.5 + (Math.random() - 0.5) * 20),
        no2: Math.round(aqi * 0.6 + (Math.random() - 0.5) * 15),
        so2: Math.round(aqi * 0.2 + (Math.random() - 0.5) * 10),
        co: Math.round(aqi * 0.3 + (Math.random() - 0.5) * 15),
        timestamp: new Date().toISOString(),
        source: 'simulated'
      });
    }
  }
  
  // Add some random high pollution spots
  for (let i = 0; i < 5; i++) {
    const lat = 40.65 + Math.random() * 0.13;
    const lng = -74.08 + Math.random() * 0.15;
    const aqi = 180 + Math.random() * 70;
    
    data.push({
      id: `hotspot-${i}-${Date.now()}`,
      location: { latitude: lat, longitude: lng },
      aqi: Math.round(aqi),
      pm25: Math.round(aqi * 0.8 + (Math.random() - 0.5) * 20),
      pm10: Math.round(aqi * 1.0 + (Math.random() - 0.5) * 25),
      o3: Math.round(aqi * 0.6 + (Math.random() - 0.5) * 30),
      no2: Math.round(aqi * 0.7 + (Math.random() - 0.5) * 20),
      so2: Math.round(aqi * 0.3 + (Math.random() - 0.5) * 15),
      co: Math.round(aqi * 0.4 + (Math.random() - 0.5) * 20),
      timestamp: new Date().toISOString(),
      source: 'simulated'
    });
  }
  
  return data;
};

const getAQILevel = (aqi: number): string => {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
};

const getAQIColor = (aqi: number): string => {
  if (aqi <= 50) return '#22c55e'; // Green
  if (aqi <= 100) return '#facc15'; // Yellow
  if (aqi <= 150) return '#f97316'; // Orange
  if (aqi <= 200) return '#ef4444'; // Red
  if (aqi <= 300) return '#a855f7'; // Purple
  return '#881337'; // Dark Red
};

const formatPollutantValue = (value: number, pollutant: string): string => {
  if (pollutant === 'co') return `${value.toFixed(1)} ppm`;
  if (pollutant === 'o3' || pollutant === 'no2' || pollutant === 'so2') return `${value.toFixed(1)} ppb`;
  return `${value} µg/m³`;
};

export default function PollutionHeatmap({ 
  className = "",
  height = "600px",
  width = "100%",
  data: initialData,
  onLocationSelect,
  onPollutionDataSelect
}: PollutionHeatmapProps) {
  const [mapSettings, setMapSettings] = useState<MapSettings>(DEFAULT_MAP_SETTINGS);
  const [pollutionData, setPollutionData] = useState<PollutionDataPoint[]>(initialData || []);
  const [selectedPollutant, setSelectedPollutant] = useState<string>('aqi');
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);
  const [showMarkers, setShowMarkers] = useState<boolean>(true);
  const [realTimeMode, setRealTimeMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedDataPoint, setSelectedDataPoint] = useState<PollutionDataPoint | null>(null);
  
  const { toast } = useToast();
  const trackFeature = useTrackFeature('pollution-heatmap');

  // Generate mock data if none provided
  useEffect(() => {
    if (!initialData) {
      setPollutionData(generateMockPollutionData());
    }
  }, [initialData]);

  // Simulate real-time updates
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (realTimeMode && !initialData) {
      interval = setInterval(() => {
        setPollutionData(prevData => {
          return prevData.map(point => {
            // Apply small random variations to simulate real-time changes
            const variation = (Math.random() - 0.5) * 10;
            return {
              ...point,
              aqi: Math.max(0, Math.min(500, point.aqi + variation)),
              pm25: Math.max(0, point.pm25 + variation * 0.7),
              pm10: Math.max(0, point.pm10 + variation * 0.9),
              o3: Math.max(0, point.o3 + variation * 0.5),
              timestamp: new Date().toISOString()
            };
          });
        });
      }, 5000); // Update every 5 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [realTimeMode, initialData]);

  const handleRefresh = useCallback(() => {
    setIsLoading(true);
    trackFeature('refresh_data');
    
    // Simulate API call delay
    setTimeout(() => {
      if (!initialData) {
        setPollutionData(generateMockPollutionData());
      }
      setIsLoading(false);
      toast({
        title: "Data Updated",
        description: "Pollution data has been refreshed successfully.",
      });
    }, 1000);
  }, [initialData, toast, trackFeature]);

  const handleMapClick = useCallback((e: any) => {
    const { lat, lng } = e.latlng;
    onLocationSelect?.({ latitude: lat, longitude: lng });
    
    // Find nearest data point
    const nearestPoint = pollutionData.reduce((nearest, point) => {
      const distance = Math.sqrt(
        Math.pow(point.location.latitude - lat, 2) + 
        Math.pow(point.location.longitude - lng, 2)
      );
      return !nearest || distance < nearest.distance 
        ? { point, distance } 
        : nearest;
    }, null as { point: PollutionDataPoint; distance: number } | null);
    
    if (nearestPoint && nearestPoint.distance < 0.01) { // Within ~1km
      setSelectedDataPoint(nearestPoint.point);
      onPollutionDataSelect?.(nearestPoint.point);
    }
  }, [pollutionData, onLocationSelect, onPollutionDataSelect]);

  const exportData = () => {
    const dataStr = JSON.stringify(pollutionData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pollution-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Data Exported",
      description: "Pollution data has been exported successfully.",
    });
    
    trackFeature('export_data');
  };

  // Calculate map bounds to fit all data points
  const calculateBounds = (): LatLngBoundsExpression | null => {
    if (pollutionData.length === 0) return null;
    
    const lats = pollutionData.map(p => p.location.latitude);
    const lngs = pollutionData.map(p => p.location.longitude);
    
    return [
      [Math.min(...lats), Math.min(...lngs)],
      [Math.max(...lats), Math.max(...lngs)]
    ];
  };

  const selectedColorScale = POLLUTANT_COLORS[selectedPollutant] || POLLUTANT_COLORS.aqi;

  return (
    <div className={`relative ${className}`} style={{ height, width }}>
      <MapContainer
        center={[mapSettings.center.latitude, mapSettings.center.longitude]}
        zoom={mapSettings.zoom}
        minZoom={mapSettings.minZoom}
        maxZoom={mapSettings.maxZoom}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Heatmap layer */}
        {showHeatmap && pollutionData.map((point) => (
          <Circle
            key={`circle-${point.id}`}
            center={[point.location.latitude, point.location.longitude]}
            radius={500} // 500m radius
            pathOptions={{
              color: selectedColorScale[Math.min(
                Math.floor((point[selectedPollutant as keyof PollutionDataPoint] as number) / 100),
                selectedColorScale.length - 1
              )],
              fillColor: selectedColorScale[Math.min(
                Math.floor((point[selectedPollutant as keyof PollutionDataPoint] as number) / 100),
                selectedColorScale.length - 1
              )],
              fillOpacity: 0.6,
              weight: 0
            }}
          />
        ))}
        
        {/* Data point markers */}
        {showMarkers && pollutionData.map((point) => (
          <Marker
            key={`marker-${point.id}`}
            position={[point.location.latitude, point.location.longitude]}
            icon={createPollutionMarkerIcon(point.aqi)}
            eventHandlers={{
              click: () => {
                setSelectedDataPoint(point);
                onPollutionDataSelect?.(point);
              }
            }}
          >
            <Popup>
              <div className="pollution-popup">
                <h3>Pollution Data</h3>
                <div className="metric">
                  <span className="metric-label">AQI:</span>
                  <span style={{ color: getAQIColor(point.aqi), fontWeight: 'bold' }}>
                    {point.aqi} - {getAQILevel(point.aqi)}
                  </span>
                </div>
                <div className="metric">
                  <span className="metric-label">PM2.5:</span>
                  <span>{formatPollutantValue(point.pm25, 'pm25')}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">PM10:</span>
                  <span>{formatPollutantValue(point.pm10, 'pm10')}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">O₃:</span>
                  <span>{formatPollutantValue(point.o3, 'o3')}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">NO₂:</span>
                  <span>{formatPollutantValue(point.no2, 'no2')}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">SO₂:</span>
                  <span>{formatPollutantValue(point.so2, 'so2')}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">CO:</span>
                  <span>{formatPollutantValue(point.co, 'co')}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Updated:</span>
                  <span>{new Date(point.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Map Controls */}
      <div className="map-controls">
        <div className="mb-2">
          <label className="text-xs font-medium text-gray-700">Pollutant Type</label>
          <Select value={selectedPollutant} onValueChange={setSelectedPollutant}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="aqi">Air Quality Index (AQI)</SelectItem>
              <SelectItem value="pm25">PM2.5</SelectItem>
              <SelectItem value="pm10">PM10</SelectItem>
              <SelectItem value="o3">Ozone (O₃)</SelectItem>
              <SelectItem value="no2">Nitrogen Dioxide (NO₂)</SelectItem>
              <SelectItem value="so2">Sulfur Dioxide (SO₂)</SelectItem>
              <SelectItem value="co">Carbon Monoxide (CO)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-1">
          <Button
            size="sm"
            variant={showHeatmap ? "default" : "outline"}
            className="w-full"
            onClick={() => setShowHeatmap(!showHeatmap)}
          >
            {showHeatmap ? <EyeOff className="h-3 w-3 mr-1" /> : <Eye className="h-3 w-3 mr-1" />}
            Heatmap
          </Button>
          
          <Button
            size="sm"
            variant={showMarkers ? "default" : "outline"}
            className="w-full"
            onClick={() => setShowMarkers(!showMarkers)}
          >
            {showMarkers ? <EyeOff className="h-3 w-3 mr-1" /> : <Eye className="h-3 w-3 mr-1" />}
            Markers
          </Button>
          
          <Button
            size="sm"
            variant={realTimeMode ? "default" : "outline"}
            className="w-full"
            onClick={() => setRealTimeMode(!realTimeMode)}
          >
            {realTimeMode ? <Pause className="h-3 w-3 mr-1" /> : <Play className="h-3 w-3 mr-1" />}
            Live
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            {isLoading ? (
              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
            ) : (
              <RefreshCw className="h-3 w-3 mr-1" />
            )}
            Refresh
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            onClick={exportData}
          >
            <Download className="h-3 w-3 mr-1" />
            Export
          </Button>
        </div>
      </div>
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[1000]">
        <Card className="pollution-legend">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{selectedPollutant.toUpperCase()} Scale</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            {selectedPollutant === 'aqi' ? (
              <div className="space-y-1">
                {POLLUTION_LEGENDS.map((legend, index) => (
                  <div key={index} className="legend-item">
                    <div 
                      className="legend-color" 
                      style={{ backgroundColor: legend.color }}
                    />
                    <span className="text-xs">{legend.label}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-1">
                {selectedColorScale.map((color, index) => (
                  <div key={index} className="legend-item">
                    <div 
                      className="legend-color" 
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-xs">
                      {Math.round((index / (selectedColorScale.length - 1)) * 500)}+
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Selected Data Point Panel */}
      {selectedDataPoint && (
        <div className="absolute top-4 right-4 z-[1000] w-80">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Selected Location
              </CardTitle>
              <CardDescription>
                {selectedDataPoint.location.latitude.toFixed(4)}, {selectedDataPoint.location.longitude.toFixed(4)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Air Quality Index</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold" style={{ color: getAQIColor(selectedDataPoint.aqi) }}>
                      {selectedDataPoint.aqi}
                    </span>
                    <Badge variant="outline">{getAQILevel(selectedDataPoint.aqi)}</Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">PM2.5:</span>
                    <div className="font-medium">{formatPollutantValue(selectedDataPoint.pm25, 'pm25')}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">PM10:</span>
                    <div className="font-medium">{formatPollutantValue(selectedDataPoint.pm10, 'pm10')}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">O₃:</span>
                    <div className="font-medium">{formatPollutantValue(selectedDataPoint.o3, 'o3')}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">NO₂:</span>
                    <div className="font-medium">{formatPollutantValue(selectedDataPoint.no2, 'no2')}</div>
                  </div>
                </div>
                
                <div className="pt-2 border-t">
                  <div className="text-xs text-gray-500">
                    Updated: {new Date(selectedDataPoint.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}