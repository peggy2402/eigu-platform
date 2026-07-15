import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WorkflowGateway } from './workflow.gateway';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, WorkflowGateway],
})
export class AppModule {}
