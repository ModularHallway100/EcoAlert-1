import { Flame, Siren, Car, HeartPulse, AlertTriangle, Waves } from 'lucide-react';
import type { AQILevel, EmergencyType, ThresholdLevel } from './types';

export const MAX_HISTORY_LENGTH = 20;
export const AQI_HAZARDOUS_THRESHOLD = 151;
export const POLLUTANTS = ["PM2.5", "O3", "NO2", "SO2", "CO"];
export const SIMULATION_CYCLE_TIME = 60 * 1000; // 60 seconds for a full cycle
export const SIMULATION_INTERVAL = 5000; // 5 seconds

export const AQI_LEVELS: AQILevel[] = [
  { level: "Good", min: 0, max: 50, color: "#22c55e" }, // green-500
  { level: "Moderate", min: 51, max: 100, color: "#facc15" }, // yellow-400
  { level: "Unhealthy (SG)", min: 101, max: 150, color: "#f97316" }, // orange-500
  { level: "Unhealthy", min: 151, max: 200, color: "#ef4444" }, // red-500
  { level: "Very Unhealthy", min: 201, max: 300, color: "#a855f7" }, // purple-500
  { level: "Hazardous", min: 301, max: 500, color: "#881337" }, // rose-900
];

export const PH_LEVELS: ThresholdLevel[] = [
    { level: "Danger", min: 0, max: 5.9, colorClass: "bg-red-500" },
    { level: "Caution", min: 6, max: 6.4, colorClass: "bg-yellow-500" },
    { level: "Safe", min: 6.5, max: 7.5, colorClass: "bg-green-500" },
    { level: "Caution", min: 7.6, max: 8, colorClass: "bg-yellow-500" },
    { level: "Danger", min: 8.1, max: 14, colorClass: "bg-red-500" },
];

export const TURBIDITY_LEVELS: ThresholdLevel[] = [
    { level: "Safe", min: 0, max: 25, colorClass: "bg-green-500" },
    { level: "Caution", min: 26, max: 50, colorClass: "bg-yellow-500" },
    { level: "Danger", min: 51, max: 100, colorClass: "bg-red-500" },
];

export const NOISE_LEVELS: ThresholdLevel[] = [
    { level: "Safe", min: 0, max: 70, colorClass: "bg-green-500" },
    { level: "Caution", min: 71, max: 90, colorClass: "bg-yellow-500" },
    { level: "Danger", min: 91, max: 200, colorClass: "bg-red-500" },
];


export const EMERGENCY_TYPES: EmergencyType[] = [
    {
      type: "Fire",
      icon: Flame,
      message: "Fire detected! Evacuate immediately and contact emergency services.",
    },
    {
      type: "Gas Leak",
      icon: Siren,
      message: "Potential gas leak detected. Evacuate, avoid using electronics, and call your gas provider.",
    },
    {
      type: "Accident",
      icon: Car,
      message: "An accident has been reported nearby. Proceed with caution and expect delays.",
    },
    {
      type: "Health Emergency",
      icon: HeartPulse,
      message: "A health emergency requires your attention. Please check on those around you and call for medical help if needed.",
    },
    {
      type: "High Pollution Detected",
      icon: AlertTriangle,
      message: "Air quality has reached unhealthy levels. It is advised to stay indoors and use air purifiers.",
    },
    {
      type: "Water Quality Alert",
      icon: Waves,
      message: "Water quality metrics are outside of the safe range. Avoid using tap water until further notice.",
    },
    {
      type: "Noise Pollution Alert",
      icon: AlertTriangle,
      message: "Noise levels have reached a dangerous level. It is advised to use hearing protection.",
    }
  ];
