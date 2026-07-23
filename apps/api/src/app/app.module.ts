import { Module, NestModule, MiddlewareConsumer, RequestMethod, ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WorkflowGateway } from './workflow.gateway';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { FeedbackModule } from '../feedback/feedback.module';
import { VoiceModule } from '../voice/voice.module';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { ChatModule } from '../chat/chat.module';
import { SystemConfigModule } from '../system-config/system-config.module';
import { ObfuscationModule } from '../common/obfuscation/obfuscation.module';
import { ObfuscationPrefixMiddleware } from '../common/obfuscation/obfuscation-prefix.middleware';
import { SecurityCenterModule } from '../security-center/security-center.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    FeedbackModule,
    VoiceModule,
    UsersModule,
    NotificationsModule,
    ChatModule,
    SystemConfigModule,
    ObfuscationModule,
    SecurityCenterModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    WorkflowGateway,
    {
      provide: APP_PIPE,
      useFactory: () =>
        new ValidationPipe({
          whitelist: true,
          forbidNonWhitelisted: true,
          transform: true,
        }),
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ObfuscationPrefixMiddleware)
      .forRoutes({ path: '*path', method: RequestMethod.ALL });
  }
}
