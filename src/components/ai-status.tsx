"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bot,
  Zap,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Settings,
  Info,
  BookOpen
} from "lucide-react";
import { getAIStatus } from '@/ai/genkit';
import { AIConfigurationGuide } from './ai-configuration-guide';

interface AIStatusProps {
  onConfigClick?: () => void;
}

export function AIStatus({ onConfigClick }: AIStatusProps) {
  const [status, setStatus] = useState<any>(null);
  const [checking, setChecking] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkAIStatus = async () => {
    setChecking(true);
    try {
      const aiStatus = getAIStatus();
      setStatus(aiStatus);
      setLastChecked(new Date());
    } catch (error) {
      console.error('Error checking AI status:', error);
      setStatus({
        configured: false,
        hasApiKey: false,
        environment: 'unknown',
        error: 'Failed to check AI status'
      });
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkAIStatus();
    
    // Auto-check status every 5 minutes
    const interval = setInterval(checkAIStatus, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = () => {
    if (checking) {
      return <RefreshCw className="h-4 w-4 animate-spin" />;
    }
    
    if (!status?.configured) {
      return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    }
    
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  const getStatusVariant = () => {
    if (checking) return 'default';
    if (!status?.configured) return 'destructive';
    return 'default';
  };

  const getEnvironmentBadge = () => {
    const env = status?.environment || 'development';
    const variants = {
      development: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      production: 'bg-primary text-primary-foreground hover:bg-primary/80',
      test: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'
    } as const;
    
    return (
      <Badge className={variants[env as keyof typeof variants]}>
        {env}
      </Badge>
    );
  };

  const getStatusMessage = () => {
    if (checking) return 'Checking AI configuration...';
    if (!status?.configured) {
      if (!status?.hasApiKey) {
        return 'AI API key not configured';
      }
      return 'AI not properly configured';
    }
    return 'AI is ready and configured';
  };


  return (
    <Card className="shadow-xl rounded-xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bot className="h-5 w-5" />
            AI Assistant Status
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={checkAIStatus}
            disabled={checking}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`h-4 w-4 ${checking ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant={getStatusVariant()}>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <AlertTitle className="flex items-center gap-2">
              {getStatusMessage()}
              {getEnvironmentBadge()}
            </AlertTitle>
          </div>
          <AlertDescription className="mt-2">
            {status?.error ? (
              <span className="text-sm">{status.error}</span>
            ) : status?.configured ? (
              <span className="text-sm">
                AI features are fully operational and ready to use.
              </span>
            ) : (
              <span className="text-sm">
                Some AI features may be limited or unavailable.
              </span>
            )}
          </AlertDescription>
        </Alert>

        {status && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
              <span className="text-muted-foreground">API Key</span>
              <Badge className={status.hasApiKey ? 'bg-primary text-primary-foreground hover:bg-primary/80' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}>
                {status.hasApiKey ? 'Configured' : 'Missing'}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
              <span className="text-muted-foreground">Model</span>
              <span className="font-mono text-xs">
                {status.model || 'Not configured'}
              </span>
            </div>
          </div>
        )}

        <Tabs defaultValue="status" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="status" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              Status
            </TabsTrigger>
            <TabsTrigger value="guide" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Setup Guide
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="status" className="mt-4">
            {!status?.configured && (
              <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-orange-800 dark:text-orange-200 mb-1">
                      AI Configuration Required
                    </p>
                    <p className="text-orange-700 dark:text-orange-300 mb-3">
                      To enable AI features, you need to configure a Google AI API key in your environment variables.
                    </p>
                    <div className="space-y-2">
                      <Button
                        onClick={onConfigClick}
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Configure AI Settings
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open('https://ai.google.dev/', '_blank')}
                        className="w-full"
                      >
                        Learn about Google AI
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="guide" className="mt-4">
            <AIConfigurationGuide />
          </TabsContent>
        </Tabs>

        {lastChecked && (
          <div className="text-xs text-muted-foreground text-center">
            Last checked: {lastChecked.toLocaleTimeString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Hook for checking AI status in components
export function useAIStatus() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const checkStatus = () => {
    setLoading(true);
    try {
      const aiStatus = getAIStatus();
      setStatus(aiStatus);
    } catch (error) {
      setStatus({ configured: false, error: 'Failed to load status' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return { status, loading };
}