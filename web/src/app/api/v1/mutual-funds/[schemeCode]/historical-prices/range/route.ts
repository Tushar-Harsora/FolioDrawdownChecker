import { NextRequest, NextResponse } from 'next/server';
import { ApiHistoricalPricesResponse, HistoricalPricesResponse } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { schemeCode: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const { schemeCode } = await params;

    // Basic validation
    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'startDate and endDate are required' },
        { status: 400 }
      );
    }

    // Validate ISO8601 date format (basic check)
    const iso8601Regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!iso8601Regex.test(startDate) || !iso8601Regex.test(endDate)) {
      console.error('Invalid date format provided:', { startDate, endDate });
      // Continue with request as per requirements
    }

    // Make API call to external service
    const apiUrl = `http://localhost:3000/api/v1/mutual-funds/${schemeCode}/historical-prices/range?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`;

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add timeout to prevent hanging requests
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      console.error(`External API error: ${response.status} ${response.statusText}`);

      // Return empty response for non-existent scheme codes or no data
      if (response.status === 404 || response.status === 204) {
        return NextResponse.json({
          fundId: schemeCode,
          fundName: '',
          historicalPrices: []
        });
      }

      throw new Error(`External API error: ${response.status} ${response.statusText}`);
    }

    const apiData: HistoricalPricesResponse = await response.json();

    return NextResponse.json(apiData);
  } catch (error) {
    console.error('Historical prices API error:', error);

    // Return appropriate error response
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Request timeout - please try again' },
          { status: 408 }
        );
      }

      // For any other errors, return empty data as per requirements
      return NextResponse.json({
        fundId: await params.schemeCode,
        fundName: '',
        historicalPrices: []
      });
    }

    // Fallback error response
    return NextResponse.json({
      fundId: await params.schemeCode,
      fundName: '',
      historicalPrices: []
    });
  }
}
