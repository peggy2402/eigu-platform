import { Module } from '@nestjs/common';
import { ThemeEventController } from './theme-event.controller';
import { ThemeEventService } from './theme-event.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ThemeEventController],
  providers: [ThemeEventService],
  exports: [ThemeEventService],
})
export class ThemeEventModule {}
