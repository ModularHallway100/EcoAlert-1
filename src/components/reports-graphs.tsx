"use client";

import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { HistoricalData } from "@/lib/types";
import { AQI_LEVELS } from "@/lib/constants";
import { Button } from "./ui/button";
import { Download } from "lucide-react";

type ReportsGraphsProps = {
  data: HistoricalData[];
};

const getAqiColor = (aqi: number) => {
    return AQI_LEVELS.find(level => aqi >= level.min && aqi <= level.max)?.color || '#ccc';
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const aqi = payload[0].value;
    return (
      <div className="p-2 border bg-background/95 backdrop-blur-sm shadow-lg rounded-lg">
        <p className="label font-bold">{`${label}`}</p>
        <p className="intro" style={{ color: getAqiColor(aqi) }}>{`AQI : ${aqi}`}</p>
      </div>
    );
  }
  return null;
};

export function ReportsGraphs({ data }: ReportsGraphsProps) {
  const handleExportCSV = () => {
    if (data.length === 0) return;

    const headers = ["Time,AQI"];
    const rows = data.map(item => `${item.time},${item.aqi}`);
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "pollution_history.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    if (data.length === 0) return;

    const doc = new jsPDF();
    doc.text("Pollution History", 14, 16);
    autoTable(doc, {
      head: [['Time', 'AQI']],
      body: data.map(item => [item.time, item.aqi]),
      startY: 20,
    });
    doc.save('pollution_history.pdf');
  };

  return (
    <Card className="shadow-lg rounded-lg">
      <CardHeader>
        <CardTitle className="text-2xl text-primary">Pollution History</CardTitle>
        <CardDescription>
          Showing the last {data.length} readings from the simulation.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length > 1 ? (
          <ChartContainer config={{}} className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={data}
                    margin={{
                        top: 5,
                        right: 20,
                        left: -10,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                    <XAxis dataKey="time" stroke="hsl(var(--foreground) / 0.7)" />
                    <YAxis domain={[0, 500]} stroke="hsl(var(--foreground) / 0.7)" />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                        type="monotone"
                        dataKey="aqi"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={{ r: 4, fill: 'hsl(var(--primary))' }}
                        activeDot={{ r: 8 }}
                    />
                </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            <p>Waiting for more data to display the graph...</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-4">
          <Button variant="outline" onClick={handleExportCSV} disabled={data.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Export to CSV
          </Button>
          <Button variant="outline" onClick={handleExportPDF} disabled={data.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Export to PDF
          </Button>
      </CardFooter>
    </Card>
  );
}
