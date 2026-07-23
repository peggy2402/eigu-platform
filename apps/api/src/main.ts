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

  // 2. Register public discovery endpoint /api/bootstrap for Clients
  app.getHttpAdapter().get('/api/bootstrap', (_req: any, res: any) => {
    try {
      const obfService = app.get(ObfuscationConfigService);
      res.json({
        apiPrefix: obfService.getFullPrefix(),
        minAppVersion: '1.0.0',
        maintenanceMode: false,
        timestamp: new Date().toISOString(),
      });
    } catch (e) {
      res.json({
        apiPrefix: 'api/v2-test-2026',
        minAppVersion: '1.0.0',
        maintenanceMode: false,
        timestamp: new Date().toISOString(),
      });
    }
  });

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
