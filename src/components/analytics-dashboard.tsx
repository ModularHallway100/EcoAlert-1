"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BarChart3, 
  Download, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Calendar,
  Filter,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Database,
  Zap
} from 'lucide-react';
import { analyticsService, ReportConfig, ReportFormat, MetricType, AnalyticsResult } from '@/services/analytics-service';

interface AnalyticsDashboardProps {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function AnalyticsDashboard({ 
  autoRefresh = true, 
  refreshInterval = 30000 
}: AnalyticsDashboardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsResult, setAnalyticsResult] = useState<AnalyticsResult | null>(null);
  const [cacheStats, setCacheStats] = useState<any>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportFormats, setReportFormats] = useState<ReportFormat[]>([]);
  const [selectedFormat, setSelectedFormat] = useState<ReportFormat>('json');
  const [selectedMetrics, setSelectedMetrics] = useState<MetricType[]>(['aqi', 'pm25', 'pm10']);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    end: new Date(),
  });
  const [reportName, setReportName] = useState('Environmental Analysis Report');

  // Initialize data
  useEffect(() => {
    initializeData();
    
    if (autoRefresh) {
      const interval = setInterval(() => {
        generateAnalyticsReport();
      }, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const initializeData = async () => {
    try {
      setIsLoading(true);
      
      // Get cache stats
      const statsResponse = await fetch('/api/analytics/reports?action=cache-stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setCacheStats(statsData.data);
      }
      
      // Get supported formats
      const formatsResponse = await fetch('/api/analytics/reports?action=formats');
      if (formatsResponse.ok) {
        const formatsData = await formatsResponse.json();
        setReportFormats(formatsData.data.formats);
      }
      
      // Generate initial analytics report
      await generateAnalyticsReport();
      
    } catch (error) {
      console.error('Error initializing analytics dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateAnalyticsReport = async () => {
    try {
      const config: ReportConfig = {
        id: crypto.randomUUID(),
        name: 'Real-time Analytics',
        type: 'daily',
        format: 'json',
        metrics: selectedMetrics,
        dateRange,
        filters: {},
        includeCharts: true,
        includePredictions: true,
        includeRecommendations: true,
      };

      const result = await analyticsService.generateReport(config);
      
      if (result.success && result.result) {
        setAnalyticsResult(result.result);
      }
    } catch (error) {
      console.error('Error generating analytics report:', error);
    }
  };

  const handleExportReport = async () => {
    if (!analyticsResult) return;
    
    try {
      setIsGeneratingReport(true);
      
      const response = await fetch('/api/analytics/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: reportName,
          type: 'custom',
          format: selectedFormat,
          metrics: selectedMetrics,
          dateRange,
          filters: {},
          includeCharts: true,
          includePredictions: true,
          includeRecommendations: true,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate report');
      }
      
      // The response will be a file download, so we don't need to handle the body
      console.log('Report generated successfully');
      
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const getAQICategory = (aqi: number) => {
    if (aqi <= 50) return { category: 'Good', color: 'text-green-600', bgColor: 'bg-green-50', icon: CheckCircle };
    if (aqi <= 100) return { category: 'Moderate', color: 'text-yellow-600', bgColor: 'bg-yellow-50', icon: Minus };
    if (aqi <= 150) return { category: 'Unhealthy for Sensitive Groups', color: 'text-orange-600', bgColor: 'bg-orange-50', icon: AlertTriangle };
    if (aqi <= 200) return { category: 'Unhealthy', color: 'text-red-600', bgColor: 'bg-red-50', icon: AlertTriangle };
    if (aqi <= 300) return { category: 'Very Unhealthy', color: 'text-purple-600', bgColor: 'bg-purple-50', icon: AlertTriangle };
    return { category: 'Hazardous', color: 'text-red-800', bgColor: 'bg-red-100', icon: AlertTriangle };
  };

  const getTrendIcon = (trend: 'increasing' | 'decreasing' | 'stable') => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'decreasing':
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <BarChart3 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p>Generating analytics report...</p>
        </div>
      </div>
    );
  }

  if (!analyticsResult) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-4" />
          <p>Unable to load analytics data. Please try again.</p>
        </div>
      </div>
    );
  }

  const aqiCategory = getAQICategory(analyticsResult.summary.averageAQI);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-gray-600">Advanced environmental monitoring and reporting</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={generateAnalyticsReport} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => handleExportReport()} disabled={isGeneratingReport} size="sm">
            <Download className="h-4 w-4 mr-2" />
            {isGeneratingReport ? 'Generating...' : 'Export Report'}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average AQI</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${aqiCategory.color}`}>
              {analyticsResult.summary.averageAQI}
            </div>
            <p className="text-xs text-muted-foreground">{aqiCategory.category}</p>
            <div className={`mt-2 p-2 rounded ${aqiCategory.bgColor}`}>
              <div className="flex items-center gap-1">
                {aqiCategory.icon && <aqiCategory.icon className="h-3 w-3" />}
                <span className="text-xs font-medium">{aqiCategory.category} air quality</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Coverage</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsResult.summary.coverage}%</div>
            <Progress value={analyticsResult.summary.coverage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {analyticsResult.summary.dataPoints.toLocaleString()} readings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              {analyticsResult.alerts.critical > 0 && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Critical: {analyticsResult.alerts.critical}
                </Badge>
              )}
              {analyticsResult.alerts.warnings > 0 && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Warnings: {analyticsResult.alerts.warnings}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Monitor air quality conditions closely
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {analyticsResult.dataQuality.excellent}
                </div>
                <p className="text-xs text-muted-foreground">Excellent</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {analyticsResult.dataQuality.good}
                </div>
                <p className="text-xs text-muted-foreground">Good</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Summary Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Summary Statistics</CardTitle>
                <CardDescription>Key metrics for the selected period</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Readings</span>
                  <span className="font-medium">{analyticsResult.summary.totalReadings.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Average AQI</span>
                  <span className="font-medium">{analyticsResult.summary.averageAQI}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Maximum AQI</span>
                  <span className="font-medium text-red-600">{analyticsResult.summary.maxAQI}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Minimum AQI</span>
                  <span className="font-medium text-green-600">{analyticsResult.summary.minAQI}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Data Coverage</span>
                  <span className="font-medium">{analyticsResult.summary.coverage}%</span>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
                <CardDescription>AI-generated insights and actions</CardDescription>
              </CardHeader>
              <CardContent>
                {analyticsResult.recommendations.length > 0 ? (
                  <ul className="space-y-2">
                    {analyticsResult.recommendations.map((rec: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{rec}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No specific recommendations at this time.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(analyticsResult.metrics).map(([metric, data]: [string, any]) => (
              <Card key={metric}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="capitalize">{metric}</span>
                    {getTrendIcon(data.trend)}
                  </CardTitle>
                  <CardDescription>Statistical analysis</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Average</span>
                    <span className="font-medium">{data.average.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Maximum</span>
                    <span className="font-medium">{data.max.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Minimum</span>
                    <span className="font-medium">{data.min.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Change Rate</span>
                    <span className={`font-medium ${data.changeRate > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {data.changeRate > 0 ? '+' : ''}{data.changeRate.toFixed(1)}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Air Quality Trends</CardTitle>
              <CardDescription>Historical patterns and predictions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Overall Trend</h4>
                    <p className="text-sm text-gray-600">
                      {analyticsResult.trends.aqiTrend.direction === 'up' ? 'Increasing' : 
                       analyticsResult.trends.aqiTrend.direction === 'down' ? 'Decreasing' : 'Stable'} 
                      by {analyticsResult.trends.aqiTrend.magnitude.toFixed(1)}%
                    </p>
                  </div>
                  {getTrendIcon(analyticsResult.trends.aqiTrend.direction === 'up' ? 'increasing' : 
                               analyticsResult.trends.aqiTrend.direction === 'down' ? 'decreasing' : 'stable')}
                </div>
                
                {analyticsResult.trends.aqiTrend.prediction && (
                  <Alert>
                    <Clock className="h-4 w-4" />
                    <AlertDescription>
                      Predicted AQI for next period: {analyticsResult.trends.aqiTrend.prediction.toFixed(0)}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Seasonal Patterns</h4>
                    <div className="space-y-1">
                      {analyticsResult.trends.seasonalPatterns?.slice(0, 6).map((pattern: any) => (
                        <div key={pattern.month} className="flex justify-between text-sm">
                          <span>Month {pattern.month}</span>
                          <span>{pattern.aqi.toFixed(0)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Daily Patterns</h4>
                    <div className="space-y-1">
                      {analyticsResult.trends.dailyPatterns?.slice(0, 6).map((pattern: any) => (
                        <div key={pattern.hour} className="flex justify-between text-sm">
                          <span>{pattern.hour}:00</span>
                          <span>{pattern.aqi.toFixed(0)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generate Custom Report</CardTitle>
              <CardDescription>Create and export analytics reports in various formats</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Report Name</label>
                  <input
                    type="text"
                    value={reportName}
                    onChange={(e) => setReportName(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter report name"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Export Format</label>
                  <select
                    value={selectedFormat}
                    onChange={(e) => setSelectedFormat(e.target.value as ReportFormat)}
                    className="w-full mt-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {reportFormats.map((format) => (
                      <option key={format} value={format}>
                        {format.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Date Range</label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <input
                    type="date"
                    value={dateRange.start.toISOString().split('T')[0]}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: new Date(e.target.value) }))}
                    className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="date"
                    value={dateRange.end.toISOString().split('T')[0]}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: new Date(e.target.value) }))}
                    className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Selected Metrics</label>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2 mt-2">
                  {Object.keys(analyticsResult.metrics).map((metric) => (
                    <label key={metric} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedMetrics.includes(metric as MetricType)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedMetrics(prev => [...prev, metric as MetricType]);
                          } else {
                            setSelectedMetrics(prev => prev.filter(m => m !== metric));
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm capitalize">{metric}</span>
                    </label>
                  ))}
                </div>
              </div>

              <Button 
                onClick={handleExportReport} 
                disabled={isGeneratingReport}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                {isGeneratingReport ? 'Generating Report...' : 'Generate and Export Report'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
