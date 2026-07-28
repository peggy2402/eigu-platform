import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('GlobalExceptionTelemetry');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const rawMessage =
      exception instanceof HttpException
        ? exception.getResponse()
        : (exception as any)?.message || 'Internal Server Error';

    const stack = (exception as any)?.stack || null;
    const path = request.url;
    const method = request.method;
    const timestamp = new Date().toISOString();
    const errorId = `ERR_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const message =
      typeof rawMessage === 'object' && rawMessage !== null && 'message' in (rawMessage as any)
        ? (rawMessage as any).message
        : rawMessage;

    // Log telemetry stack trace silently for backend debugging
    this.logger.error(
      `[${errorId}] ${method} ${path} - Status: ${status} - Message: ${JSON.stringify(message)}`,
    );
    if (stack) {
      this.logger.error(`[${errorId}] Stack Trace:\n${stack}`);
    }

    // Sanitize response to client: Never expose obfuscated paths or internal stack trace in 404 responses
    const isNotFound = status === HttpStatus.NOT_FOUND;
    const clientMessage = isNotFound
      ? 'Yêu cầu không hợp lệ hoặc tài nguyên không tồn tại'
      : message;

    response.status(status).json({
      statusCode: status,
      errorId,
      timestamp,
      message: clientMessage,
    });
  }
}
