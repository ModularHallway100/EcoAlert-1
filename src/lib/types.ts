
import type { LucideProps } from "lucide-react";
import type { ForwardRefExoticComponent, RefAttributes } from "react";

export type PollutionData = {
  time: string;
  aqi: number;
  ph: number;
  turbidity: number;
  noise: number;
};

export type HistoricalData = PollutionData[];

export type Emergency = {
  type: string | null;
  active: boolean;
};

export type AQILevel = {
  level: string;
  min: number;
  max: number;
  color: string;
};

export type ThresholdLevel = {
  level: 'Safe' | 'Caution' | 'Danger';
  min: number;
  max: number;
  colorClass: string;
}

export type EmergencyType = {
    type: string;
    icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
    message: string;
}

export type EnvironmentalData = {
  aqi: number | null;
  dominantPollutant: string | null;
  ph: number | null;
  turbidity: number | null;
  noise: number | null;
};

export type AlertSettings = {
  notificationsEnabled: boolean;
  aqiThreshold: number;
  phMinThreshold: number;
  phMaxThreshold: number;
  turbidityThreshold: number;
  noiseThreshold: number;
};

export type Coordinates = {
  latitude: number;
  longitude: number;
};
