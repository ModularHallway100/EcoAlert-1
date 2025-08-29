"use client";

import { useState } from 'react';
import EmptyComponent from '@/components/empty-component';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function TestDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Test Dashboard
        </h1>
        
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="command-center">Command Center</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Overview</h2>
              <p>This is a test dashboard page.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="command-center" className="space-y-6">
            <EmptyComponent />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}