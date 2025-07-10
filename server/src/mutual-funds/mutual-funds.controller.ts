
import { Controller, Get, Query, Param } from '@nestjs/common';
import { MutualFundsService } from './mutual-funds.service';
import { GetMutualFundsDto } from './dto/get-mutual-funds.dto';
import { SearchMutualFundsDto } from './dto/search-mutual-funds.dto';
import { GetHistoricalPricesDto } from './dto/get-historical-prices.dto';

@Controller('api/v1/mutual-funds')
export class MutualFundsController {
  constructor(private readonly mutualFundsService: MutualFundsService) {}

  @Get()
  findAll(@Query() getMutualFundsDto: GetMutualFundsDto) {
    return this.mutualFundsService.findAll(getMutualFundsDto);
  }

  @Get('search')
  search(@Query() searchMutualFundsDto: SearchMutualFundsDto) {
    return this.mutualFundsService.search(searchMutualFundsDto);
  }

  @Get(':fundId/historical-prices')
  getHistoricalPrices(@Param('fundId') fundId: string) {
    return this.mutualFundsService.getHistoricalPrices(fundId);
  }

  @Get(':fundId/historical-prices/range')
  getHistoricalPricesByRange(
    @Param('fundId') fundId: string,
    @Query() getHistoricalPricesDto: GetHistoricalPricesDto,
  ) {
    return this.mutualFundsService.getHistoricalPricesByRange(
      fundId,
      getHistoricalPricesDto,
    );
  }
}
