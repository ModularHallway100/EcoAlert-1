
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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { HistoricalData } from "@/lib/types";
import { Button } from "./ui/button";
import { Download } from "lucide-react";

type ReportsGraphsProps = {
  data: HistoricalData[];
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 border bg-background/95 backdrop-blur-sm shadow-lg rounded-lg">
        <p className="label font-bold">{`${label}`}</p>
        {payload.map((pld: any) => (
            <p key={pld.dataKey} className="intro" style={{ color: pld.stroke || pld.fill }}>
                {`${pld.name} : ${pld.value}`}
            </p>
        ))}
      </div>
    );
  }
  return null;
};

export function ReportsGraphs({ data }: ReportsGraphsProps) {
  const handleExportCSV = () => {
    if (data.length === 0) return;

    const headers = ["Time,AQI,pH,Turbidity (NTU),Noise (dB)"];
    const rows = data.map(item => `${item.aqi},${item.ph},${item.turbidity},${item.noise}`);
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "environmental_history.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    if (data.length === 0) return;

    const doc = new jsPDF();
    doc.text("Environmental History", 14, 16);
    autoTable(doc, {
      head: [['Time', 'AQI', 'pH', 'Turbidity (NTU)', 'Noise (dB)']],
      body: data.map(item => [item.time, item.aqi, item.ph, item.turbidity, item.noise]),
      startY: 20,
    });
    doc.save('environmental_history.pdf');
  };

  const chartData = data.map(d => ({ ...d, aqi: d.aqi, noise: d.noise, ph: d.ph, turbidity: d.turbidity }));

  return (
    <Card className="shadow-lg rounded-lg">
      <CardHeader>
        <CardTitle className="text-2xl text-primary">Environmental History</CardTitle>
        <CardDescription>
          Showing the last {data.length} readings from the simulation.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length > 1 ? (
          <ChartContainer config={{}} className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={chartData}
                    margin={{
                        top: 5,
                        right: 20,
                        left: -10,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                    <XAxis dataKey="time" stroke="hsl(var(--foreground) / 0.7)" />
                    <YAxis yAxisId="left" stroke="hsl(var(--primary))" />
                    <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--accent))" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="aqi" name="AQI" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                    <Line yAxisId="right" type="monotone" dataKey="noise" name="Noise (dB)" stroke="#82ca9d" dot={false} />
                    <Line yAxisId="right" type="monotone" dataKey="ph" name="pH" stroke="#ffc658" dot={false} />
                    <Line yAxisId="right" type="monotone" dataKey="turbidity" name="Turbidity (NTU)" stroke="#ff7300" dot={false} />
                </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
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
