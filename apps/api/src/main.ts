/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Kích hoạt CORS (Quan trọng để kết nối với Web và Desktop)
  app.enableCors();

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  // === TÍCH HỢP SWAGGER ===
  const config = new DocumentBuilder()
    .setTitle('EIGU Platform API')
    .setDescription('Tài liệu API quản lý luồng tự động hóa MMO & Anti-detect TikTok')
    .setVersion('1.0')
    .addTag('Workflow', 'Quản lý luồng xử lý video (FFmpeg, Browser)')
    .addTag('System', 'Cấu hình và trạng thái hệ thống')
    // Nếu tương lai bạn cần xác thực (JWT), uncomment dòng dưới
    // .addBearerAuth()
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'EIGU API Documentation',
    customfavIcon: 'https://swagger.io/favicon-32x32.png',
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.js',
    ],
    customCssUrl: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.css',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.css',
    ],
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
  Logger.log(
    `📚 Swagger Documentation is available at: http://localhost:${port}/api/docs`
  );
}

bootstrap();
