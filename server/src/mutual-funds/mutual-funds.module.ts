
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/cache-manager';
import { MutualFundsController } from './mutual-funds.controller';
import { MutualFundsService } from './mutual-funds.service';

@Module({
  imports: [
    HttpModule,
    CacheModule.register({
      ttl: 21600, // 6 hours in seconds
    }),
  ],
  controllers: [MutualFundsController],
  providers: [MutualFundsService],
})
export class MutualFundsModule {}
