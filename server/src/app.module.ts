import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MutualFundsModule } from './mutual-funds/mutual-funds.module';

@Module({
  imports: [MutualFundsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
