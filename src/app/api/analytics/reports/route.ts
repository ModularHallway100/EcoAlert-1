import { NextRequest, NextResponse } from 'next/server';
import { analyticsService } from '@/services/analytics-service';
import { ReportConfig, ReportFormat } from '@/services/analytics-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const { 
      name, 
      type, 
      format = 'json' as ReportFormat, 
      metrics, 
      dateRange, 
      filters, 
      includeCharts = false, 
      includePredictions = false, 
      includeRecommendations = true 
    } = body;

    if (!name || !type || !dateRange || !dateRange.start || !dateRange.end) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required fields: name, type, dateRange.start, dateRange.end'
        },
        { status: 400 }
      );
    }

    // Create report configuration
    const config: ReportConfig = {
      id: crypto.randomUUID(),
      name,
      type: type as ReportConfig['type'],
      format,
      metrics: metrics || ['aqi', 'pm25', 'pm10', 'ozone', 'no2', 'so2', 'co'],
      dateRange: {
        start: new Date(dateRange.start),
        end: new Date(dateRange.end),
      },
      filters: filters || {},
      includeCharts,
      includePredictions,
      includeRecommendations,
    };

    // Validate date range
    if (config.dateRange.start >= config.dateRange.end) {
      return NextResponse.json(
        { 
          success: false,
          error: 'End date must be after start date'
        },
        { status: 400 }
      );
    }

    // Generate analytics report
    const result = await analyticsService.generateReport(config);

    if (!result.success) {
      return NextResponse.json(
        { 
          success: false,
          error: result.error 
        },
        { status: 500 }
      );
    }

    // Export to requested format
    let exportedData: string | Buffer;
    let contentType: string;
    let filename: string;

    switch (format) {
      case 'json':
        exportedData = JSON.stringify(result.result, null, 2);
        contentType = 'application/json';
        filename = `${name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.json`;
        break;
      
      case 'csv':
        exportedData = analyticsService.exportAnalytics(result.result!, 'csv');
        contentType = 'text/csv';
        filename = `${name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`;
        break;
      
      case 'pdf':
        // In a real implementation, you would generate a PDF
        exportedData = 'PDF export functionality would be implemented here';
        contentType = 'application/pdf';
        filename = `${name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.pdf`;
        break;
      
      case 'xlsx':
        // In a real implementation, you would generate an Excel file
        exportedData = 'Excel export functionality would be implemented here';
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        filename = `${name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.xlsx`;
        break;
      
      default:
        return NextResponse.json(
          { 
            success: false,
            error: `Unsupported export format: ${format}`
          },
          { status: 400 }
        );
    }

    // Return the report
    return new NextResponse(exportedData, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });

  } catch (error) {
    console.error('Error generating analytics report:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'cache-stats') {
      // Get cache statistics
      const stats = analyticsService.getCacheStats();
      return NextResponse.json({
        success: true,
        data: stats,
      });
    }

    if (action === 'clear-cache') {
      // Clear analytics cache
      analyticsService.clearCache();
      return NextResponse.json({
        success: true,
        message: 'Analytics cache cleared successfully',
      });
    }

    if (action === 'formats') {
      // Get supported export formats
      return NextResponse.json({
        success: true,
        data: {
          formats: ['json', 'csv', 'pdf', 'xlsx'],
          descriptions: {
            json: 'JavaScript Object Notation - structured data format',
            csv: 'Comma-Separated Values - spreadsheet-compatible format',
            pdf: 'Portable Document Format - print-ready format',
            xlsx: 'Excel Spreadsheet - Microsoft Excel format',
          },
        },
      });
    }

    // Default: list recent reports (mock implementation)
    return NextResponse.json({
      success: true,
      data: {
        reports: [
          {
            id: '1',
            name: 'Daily Air Quality Report',
            type: 'daily',
            format: 'json',
            createdAt: new Date().toISOString(),
            status: 'completed',
          },
          {
            id: '2',
            name: 'Weekly Environmental Analysis',
            type: 'weekly',
            format: 'csv',
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'completed',
          },
        ],
      },
    });

  } catch (error) {
    console.error('Error handling analytics request:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}