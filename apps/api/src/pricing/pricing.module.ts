import { Module } from '@nestjs/common';
import { PricingController } from './pricing.controller';
import { PricingService } from './pricing.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AffiliateModule } from '../affiliate/affiliate.module';

@Module({
  imports: [PrismaModule, AffiliateModule],
  controllers: [PricingController],
  providers: [PricingService],
  exports: [PricingService],
})
export class PricingModule {}

