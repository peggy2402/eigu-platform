import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { NewsService } from './news.service';
import { NewsController } from './news.controller';
import { PublicNewsController } from './public-news.controller';

@Module({
  imports: [PrismaModule],
  controllers: [NewsController, PublicNewsController],
  providers: [NewsService],
  exports: [NewsService],
})
export class NewsModule {}
