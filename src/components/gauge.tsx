"use client";

import { AQI_LEVELS } from "@/lib/constants";

type GaugeProps = {
  value: number;
};

const getAqiDetails = (aqi: number) => {
  return (
    AQI_LEVELS.find((level) => aqi >= level.min && aqi <= level.max) ||
    AQI_LEVELS[AQI_LEVELS.length - 1]
  );
};

export function Gauge({ value }: GaugeProps) {
  const aqiDetails = getAqiDetails(value);
  const percentage = Math.min(Math.max(value / 500, 0), 1);
  const circumference = 2 * Math.PI * 52;
  const strokeDashoffset = circumference - percentage * circumference * 0.75; // 0.75 for 3/4 circle

  return (
    <div className="relative flex items-center justify-center w-64 h-64 md:w-80 md:h-80 mx-auto">
      <svg
        className="w-full h-full transform -rotate-[225deg]"
        viewBox="0 0 120 120"
      >
        <circle
          className="text-secondary"
          strokeWidth="12"
          stroke="currentColor"
          fill="transparent"
          r="52"
          cx="60"
          cy="60"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - circumference * 0.75}
        />
        <circle
          stroke={aqiDetails.color}
          strokeWidth="12"
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r="52"
          cx="60"
          cy="60"
          strokeDasharray={circumference}
          style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.5s ease-out' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span
          className="text-6xl md:text-7xl font-bold font-headline"
          style={{ color: aqiDetails.color }}
        >
          {Math.round(value)}
        </span>
        <span className="text-xl font-medium text-muted-foreground">AQI</span>
        <span
          className="text-lg font-semibold mt-2 px-4 py-1 rounded-full"
          style={{ backgroundColor: `${aqiDetails.color}20`, color: aqiDetails.color }}
        >
          {aqiDetails.level}
        </span>
      </div>
    </div>
  );
}
