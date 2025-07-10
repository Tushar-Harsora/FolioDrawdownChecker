Generate a list of RESTful backend API endpoints (in JSON format) to support a frontend application displaying mutual fund data. The backend will automatically scrape data from external upstream sources and implement time-based caching (with no specific TTL preference, implying a default/configurable sensible value) for performance.
The APIs should adhere to RESTful best practices for endpoint naming (plural nouns for collections, lowercase, kebab-case for multiple words, no verbs in URLs) and use query parameters for pagination, limits, and date ranges. fundId will be an internal ID. Standard HTTP status codes and backend logging should be used for error handling.
The APIs should provide the following functionalities:
1. Retrieve Paginated List of Mutual Funds:
    * Endpoint: /api/v1/mutual-funds
    * Method: GET
    * Description: Fetches a paginated list of all available mutual funds, providing only their basic metadata.
    * Query Parameters:
        * page (integer, default 1): The page number for pagination.
        * limit (integer, default 20): The number of mutual funds per page.
    * Response (JSON Object):
        * data (array of objects): Each object represents a mutual fund and should minimally include:
            * fundId (string, internal ID)
            * fundName (string)
            * fundType (string)
            * The structure of this object should be extensible for future inclusion of other relevant data points.
        * pagination (object): Contains metadata for pagination, including:
            * currentPage (integer)
            * totalPages (integer)
            * totalItems (integer)
2. Fuzzy Search Mutual Funds:
    * Endpoint: /api/v1/mutual-funds/search
    * Method: GET
    * Description: Performs a fuzzy search on mutual fund names. The prioritization of search results (e.g., exact matches vs. partial) is not specified and can be determined by the backend implementation.
    * Query Parameters:
        * q (string, required): The search query for mutual fund names.
        * limit (integer, default 10): The maximum number of search results to return.
    * Response (JSON Array of Objects): Returns a list of matching mutual fund objects, similar to the data structure in the "Retrieve Paginated List of Mutual Funds" response (i.e., fundId, fundName, fundType), without historical prices.
3. Get Historical Price Data for a Specific Fund (Full History):
    * Endpoint: /api/v1/mutual-funds/{fundId}/historical-prices
    * Method: GET
    * Description: Retrieves daily historical price data for a given mutual fund over at least a 10-year period.
    * Path Parameters:
        * fundId (string, required): Unique internal identifier for the mutual fund.
    * Response (JSON Object):
        * fundId (string)
        * historicalPrices (array of objects): Each object representing a daily price point, sorted by date with the latest date first:
            * date (string, YYYY-MM-DD)
            * price (number)
        * If data for a specific date is unavailable from the upstream source, return partial data for the available dates.
4. Get Historical Price Data for a Specific Fund within a Period:
    * Endpoint: /api/v1/mutual-funds/{fundId}/historical-prices/range
    * Method: GET
    * Description: Retrieves daily historical price data for a given mutual fund strictly within the specified date range.
    * Path Parameters:
        * fundId (string, required): Unique internal identifier for the mutual fund.
    * Query Parameters:
        * startDate (string, YYYY-MM-DD, required): The inclusive start date of the period.
        * endDate (string, YYYY-MM-DD, required): The inclusive end date of the period.
    * Response (JSON Object):
        * fundId (string)
        * historicalPrices (array of objects): Each object representing a daily price point, sorted by date with the latest date first:
            * date (string, YYYY-MM-DD)
            * price (number)
        * If data for a specific date within the requested range is unavailable, return partial data for the available dates within that precise range.
General Assumptions:
* The frontend requires approximately a couple of hundred mutual funds in total.
* No authentication or authorization is required for these APIs.
* The response format for all APIs should be JSON.
* There are no strict performance or latency expectations beyond what caching provides at this stage.
* Caching strategy: Time-based expiry (exact TTL can be a default or configured later).
* Error handling: Standard HTTP status codes and logging on the backend.
* The backend will automatically manage data fetching from upstream sources; no manual trigger endpoints for scraping/ingestion are required.
