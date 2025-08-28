import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Map, Users, MessageSquare } from 'lucide-react';

const EmergencyCommandCenter = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Emergency Command Center</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Communication</CardTitle>
          </CardHeader>
        </Card>
      </CardContent>
    <Card className="md:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Communication</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-32 bg-secondary rounded-md p-2">
          <p className="text-muted-foreground">Communication log placeholder</p>
        </div>
      </CardContent>
    </Card>
  );
};
export default EmergencyCommandCenter;