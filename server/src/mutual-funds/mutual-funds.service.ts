
import { Injectable, Inject, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Observable, from, map, switchMap, tap } from 'rxjs';
import { GetMutualFundsDto, GetMutualFundsResponseDto, SearchMutualFundsResponseDto } from './dto/get-mutual-funds.dto';
import { SearchMutualFundsDto } from './dto/search-mutual-funds.dto';
import { GetHistoricalPricesDto, GetHistoricalPricesResponseDto } from './dto/get-historical-prices.dto';
import { MfApiResponseDto } from './dto/mfapi/mfapi-response.dto';
import { MfApiMutualFundDto } from './dto/mfapi/mfapi-mutual-fund.dto';
import { MfApiHistoricalResponseDto } from './dto/mfapi/mfapi-historical-response.dto';
import { MfApiHistoricalDataDto } from './dto/mfapi/mfapi-historical-response.dto';

@Injectable()
export class MutualFundsService {
  private readonly logger = new Logger(MutualFundsService.name);
  private readonly CACHE_KEY = 'mf-api-data';

  constructor(
    private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  findAll(getMutualFundsDto: GetMutualFundsDto): Observable<GetMutualFundsResponseDto> {
    const { page = 1, limit = 20 } = getMutualFundsDto;
    
    return this.getMutualFundsData().pipe(
      map(allFunds => {
        const totalItems = allFunds.length;
        const totalPages = Math.ceil(totalItems / limit);
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedFunds = allFunds.slice(startIndex, endIndex);

        const transformedData = paginatedFunds.map(fund => ({
          schemeCode: fund.schemeCode,
          schemeName: fund.schemeName,
        }));

        return {
          data: transformedData,
          pagination: {
            currentPage: page,
            totalPages,
            totalItems,
          },
        };
      })
    );
  }

  search(searchMutualFundsDto: SearchMutualFundsDto): Observable<SearchMutualFundsResponseDto> {
    const { q, page = 1, limit = 10 } = searchMutualFundsDto;
    
    this.logger.log(`Searching mutual funds with query: "${q}"`);
    
    return this.getMutualFundsData().pipe(
      map(allFunds => {
        // Perform fuzzy search
        const searchResults = this.performFuzzySearch(allFunds, q);
        
        // Apply pagination
        const totalItems = searchResults.length;
        const totalPages = Math.ceil(totalItems / limit);
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedResults = searchResults.slice(startIndex, endIndex);

        const transformedData = paginatedResults.map(result => ({
          schemeCode: result.fund.schemeCode,
          schemeName: result.fund.schemeName,
        }));

        this.logger.log(`Search completed: Found ${totalItems} results for query "${q}"`);

        return {
          data: transformedData,
          pagination: {
            currentPage: page,
            totalPages,
            totalItems,
          },
        };
      })
    );
  }

  private getMutualFundsData(): Observable<MfApiResponseDto> {
    return from(this.cacheManager.get<MfApiResponseDto>(this.CACHE_KEY)).pipe(
      switchMap(cachedData => {
        if (cachedData) {
          // Use cached data
          this.logger.log('Cache hit: Using cached mutual funds data');
          return from([cachedData]);
        } else {
          // Fetch from API and cache
          this.logger.log('Cache miss: Fetching mutual funds data from MF API');
          this.logger.log('Calling MF API: https://api.mfapi.in/mf');
          return this.httpService.get<MfApiResponseDto>('https://api.mfapi.in/mf').pipe(
            tap(() => this.logger.log('Successfully received response from MF API')),
            map(response => response.data),
            switchMap(apiData => {
              // Store in cache
              this.logger.log(`Successfully cached mutual funds data (${apiData.length} items)`);
              return from(this.cacheManager.set(this.CACHE_KEY, apiData)).pipe(
                map(() => apiData)
              );
            })
          );
        }
      })
    );
  }

  private performFuzzySearch(funds: MfApiMutualFundDto[], query: string): Array<{fund: MfApiMutualFundDto, score: number}> {
    const queryLower = query.toLowerCase();
    const results: Array<{fund: MfApiMutualFundDto, score: number}> = [];

    for (const fund of funds) {
      const schemeName = fund.schemeName.toLowerCase();
      let score = 0;

      // Exact match (case-insensitive)
      if (schemeName === queryLower) {
        score = 100;
      }
      // Starts with query
      else if (schemeName.startsWith(queryLower)) {
        score = 80;
      }
      // Contains query
      else if (schemeName.includes(queryLower)) {
        score = 60;
      }
      // Fuzzy similarity (simple word matching)
      else {
        const similarity = this.calculateSimilarity(schemeName, queryLower);
        if (similarity > 0.3) { // Only include if similarity is above threshold
          score = Math.floor(similarity * 50); // Scale to 0-50
        }
      }

      if (score > 0) {
        results.push({ fund, score });
      }
    }

    // Sort by score (highest first)
    return results.sort((a, b) => b.score - a.score);
  }

  private calculateSimilarity(text: string, query: string): number {
    const textWords = text.split(/\s+/);
    const queryWords = query.split(/\s+/);
    let matchCount = 0;

    for (const queryWord of queryWords) {
      for (const textWord of textWords) {
        if (textWord.includes(queryWord) || queryWord.includes(textWord)) {
          matchCount++;
          break;
        }
      }
    }

    return matchCount / queryWords.length;
  }

  getHistoricalPrices(fundId: string): Observable<GetHistoricalPricesResponseDto> {
    this.logger.log(`Fetching historical prices for fund ID: ${fundId}`);
    
    return this.getHistoricalPricesData(fundId).pipe(
      map(apiResponse => {
        const transformedData = apiResponse.data.map(item => ({
          date: item.date,
          nav: parseFloat(item.nav),
        }));

        return {
          fundId,
          fundName: apiResponse.meta.scheme_name,
          historicalPrices: transformedData,
        };
      })
    );
  }

  private getHistoricalPricesData(fundId: string): Observable<MfApiHistoricalResponseDto> {
    const cacheKey = `historical-prices-${fundId}`;
    
    return from(this.cacheManager.get<MfApiHistoricalResponseDto>(cacheKey)).pipe(
      switchMap(cachedData => {
        if (cachedData) {
          // Use cached data
          return from([cachedData]);
        } else {
          // Fetch from API and cache
          this.logger.log(`Cache miss: Fetching historical prices data from MF API for fund ${fundId}`);
          this.logger.log(`Calling MF API: https://api.mfapi.in/mf/${fundId}`);
          return this.httpService.get<MfApiHistoricalResponseDto>(`https://api.mfapi.in/mf/${fundId}`).pipe(
            tap(() => this.logger.log(`Successfully received historical prices response from MF API for fund ${fundId}`)),
            map(response => response.data),
            switchMap(apiData => {
              // Store in cache
              this.logger.log(`Successfully cached historical prices data for fund ${fundId} (${apiData.data.length} price points)`);
              return from(this.cacheManager.set(cacheKey, apiData)).pipe(
                map(() => apiData)
              );
            })
          );
        }
      })
    );
  }

  getHistoricalPricesByRange(
    fundId: string,
    getHistoricalPricesDto: GetHistoricalPricesDto,
  ): Observable<GetHistoricalPricesResponseDto> {
    const { startDate, endDate } = getHistoricalPricesDto;
    
    return this.getHistoricalPricesData(fundId).pipe(
      map(apiResponse => {
        // Filter data by date range (inclusive)
        const filteredData = this.filterByDateRange(apiResponse.data, startDate, endDate);
        
        const transformedData = filteredData.map(item => ({
          date: item.date,
          nav: parseFloat(item.nav),
        }));

        this.logger.log(`Date range filtering completed: Found ${transformedData.length} price points for fund ${fundId} between ${startDate} and ${endDate}`);

        return {
          fundId,
          fundName: apiResponse.meta.scheme_name,
          historicalPrices: transformedData, // Will be empty array if no data in range
        };
      })
    );
  }

  private filterByDateRange(
    data: MfApiHistoricalDataDto[], 
    startDate: string, 
    endDate: string
  ): MfApiHistoricalDataDto[] {
    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return data.filter(item => {
      // Convert API date format (DD-MM-YYYY) to Date object
      const itemDate = this.parseApiDate(item.date);
      return itemDate >= start && itemDate <= end;
    });
  }

  private parseApiDate(dateStr: string): Date {
    // Convert "09-07-2025" to Date object
    const [day, month, year] = dateStr.split('-');
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }
}
