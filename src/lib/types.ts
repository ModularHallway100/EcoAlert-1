import type { LucideProps } from "lucide-react";
import type { ForwardRefExoticComponent, RefAttributes } from "react";

export type HistoricalData = {
  time: string;
  aqi: number;
};

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

export type EmergencyType = {
    type: string;
    icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
    message: string;
}

export type AqiData = {
  aqi: number | null;
  dominantPollutant: string | null;
};
