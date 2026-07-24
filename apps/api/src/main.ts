import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(__dirname, '../.env') });
config({ path: resolve(__dirname, '../../apps/api/.env') });
config({ path: 'apps/api/.env' });
config({ path: '.env' });

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app/app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ObfuscationConfigService } from './common/obfuscation/obfuscation-config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  // 1. Set NestJS Global Prefix to /api
  app.setGlobalPrefix('api');

  // 2. Register public discovery endpoints for Clients (/api/bootstrap & /api/system-config/bootstrap)
  const bootstrapHandler = (_req: any, res: any) => {
    try {
      const obfService = app.get(ObfuscationConfigService);
      res.json({
        apiPrefix: obfService.getFullPrefix(),
        minAppVersion: '1.0.0',
        maintenanceMode: false,
        timestamp: new Date().toISOString(),
      });
    } catch (e) {
      const defaultPrefix = process.env.API_PREFIX ? (process.env.API_PREFIX.startsWith('api/') ? process.env.API_PREFIX : `api/${process.env.API_PREFIX}`) : 'api/v2-sec-2026';
      res.json({
        apiPrefix: defaultPrefix,
        minAppVersion: '1.0.0',
        maintenanceMode: false,
        timestamp: new Date().toISOString(),
      });
    }
  };

  app.getHttpAdapter().get('/api/bootstrap', bootstrapHandler);
  app.getHttpAdapter().get('/api/system-config/bootstrap', bootstrapHandler);

  app.useGlobalFilters(new AllExceptionsFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('EIGU Platform API Gateway')
    .setDescription('Tài liệu API Obfuscation Gateway')
    .setVersion('1.0')
    .addTag('Auth', 'Xác thực người dùng')
    .addTag('Workflow', 'Quản lý luồng xử lý')
    .addTag('System', 'Cấu hình và trạng thái hệ thống')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'EIGU API Documentation',
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  Logger.log(`🚀 EIGU API Gateway running on: http://localhost:${port}/api`);
  Logger.log(`📚 Swagger Documentation: http://localhost:${port}/api/docs`);
}

bootstrap();
