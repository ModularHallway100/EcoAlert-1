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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Live Incident Map</CardTitle>
            <Map className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-secondary rounded-md flex items-center justify-center">
              <p className="text-muted-foreground">Map placeholder</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Incidents</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-secondary rounded-md p-2">
              <p className="text-muted-foreground">Incident list placeholder</p>
            </div>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Communication</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="h-32 bg-secondary rounded-md p-2">
              <p className="text-muted-foreground">Communication log placeholder</p>
            </div>
            <div className="flex gap-2 mt-2">
              <Button>Send Alert</Button>
              <Button variant="outline">Dispatch Team</Button>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};

export default EmergencyCommandCenter;