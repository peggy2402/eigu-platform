import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('EIGU Platform API')
    .setDescription('Tài liệu API quản lý luồng tự động hóa MMO & Anti-detect TikTok')
    .setVersion('1.0')
    .addTag('Auth', 'Xác thực người dùng (Register, Login, OTP, JWT)')
    .addTag('Workflow', 'Quản lý luồng xử lý video (FFmpeg, Browser)')
    .addTag('System', 'Cấu hình và trạng thái hệ thống')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'EIGU API Documentation',
    customfavIcon: 'https://swagger.io/favicon-32x32.png',
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  Logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);
  Logger.log(`📚 Swagger Documentation: http://localhost:${port}/api/docs`);
}

bootstrap();
