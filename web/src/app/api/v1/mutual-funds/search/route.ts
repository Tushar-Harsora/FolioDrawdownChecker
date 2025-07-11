import { NextRequest, NextResponse } from 'next/server';
import { ApiSearchResponse, SearchResponse } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const page = searchParams.get('page') || '1';

    if (!query || query.length < 3) {
      return NextResponse.json({ 
        funds: [], 
        total: 0,
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalItems: 0
        }
      });
    }

    // Make real API call to external mutual funds service
    const apiUrl = `http://localhost:3000/api/v1/mutual-funds/search?q=${encodeURIComponent(query)}&page=${page}`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add timeout to prevent hanging requests
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      throw new Error(`External API error: ${response.status} ${response.statusText}`);
    }

    const apiData: ApiSearchResponse = await response.json();

    // Transform the external API response to match our internal structure
    const transformedResponse: SearchResponse = {
      funds: apiData.data || [],
      total: apiData.pagination?.totalItems || 0,
      pagination: apiData.pagination
    };

    return NextResponse.json(transformedResponse);
  } catch (error) {
    console.error('Search API error:', error);
    
    // Return appropriate error response
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Request timeout - please try again' },
          { status: 408 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to fetch mutual funds data' },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
