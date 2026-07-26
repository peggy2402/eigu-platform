import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { BusinessError, ErrorCodes } from '../errors/business-error';

const PRISMA_ERROR_MAP: Record<string, { status: number; message: string; errorCode: string }> = {
  P2000: { status: 400, message: 'Input value is too long for the field.', errorCode: ErrorCodes.VALIDATION_ERROR },
  P2001: { status: 404, message: 'The requested resource does not exist.', errorCode: ErrorCodes.PRISMA_NOT_FOUND },
  P2002: { status: 409, message: 'A resource with this identifier already exists.', errorCode: ErrorCodes.PRISMA_UNIQUE_CONSTRAINT },
  P2003: { status: 400, message: 'Referenced resource not found.', errorCode: ErrorCodes.PRISMA_FOREIGN_KEY },
  P2004: { status: 400, message: 'A database constraint was violated.', errorCode: ErrorCodes.VALIDATION_ERROR },
  P2005: { status: 400, message: 'Invalid value for the field.', errorCode: ErrorCodes.VALIDATION_ERROR },
  P2006: { status: 400, message: 'Invalid value provided.', errorCode: ErrorCodes.VALIDATION_ERROR },
  P2007: { status: 400, message: 'Database validation error.', errorCode: ErrorCodes.VALIDATION_ERROR },
  P2011: { status: 400, message: 'A required field is missing.', errorCode: ErrorCodes.VALIDATION_ERROR },
  P2012: { status: 400, message: 'Missing required value.', errorCode: ErrorCodes.VALIDATION_ERROR },
  P2014: { status: 400, message: 'Required relation violation.', errorCode: ErrorCodes.VALIDATION_ERROR },
  P2015: { status: 404, message: 'Related record not found.', errorCode: ErrorCodes.PRISMA_NOT_FOUND },
  P2016: { status: 400, message: 'Query interpretation error.', errorCode: ErrorCodes.VALIDATION_ERROR },
  P2025: { status: 404, message: 'Resource not found.', errorCode: ErrorCodes.PRISMA_NOT_FOUND },
};

function extractPrismaError(exception: any): { status: number; message: string; errorCode: string } | null {
  if (exception?.code && PRISMA_ERROR_MAP[exception.code]) {
    return PRISMA_ERROR_MAP[exception.code];
  }

  const msg: string = exception?.message || '';
  if (msg.includes('Foreign key constraint violated') || msg.includes('foreign key constraint')) {
    const match = msg.match(/`([^`]+)`_fkey/);
    const field = match ? match[1] : 'unknown';
    return {
      status: 400,
      message: `Referenced ${field} not found. Please ensure the related resource exists.`,
      errorCode: ErrorCodes.PRISMA_FOREIGN_KEY,
    };
  }
  if (msg.includes('Unique constraint failed') || msg.includes('Unique constraint')) {
    return { status: 409, message: 'A resource with this identifier already exists.', errorCode: ErrorCodes.PRISMA_UNIQUE_CONSTRAINT };
  }
  if (msg.includes('Record to delete does not exist')) {
    return { status: 404, message: 'Resource not found.', errorCode: ErrorCodes.PRISMA_NOT_FOUND };
  }

  return null;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('GlobalExceptionTelemetry');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const stack = (exception as any)?.stack || null;
    const path = request.url;
    const method = request.method;
    const timestamp = new Date().toISOString();
    const errorId = `ERR_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    let status: number;
    let clientMessage: string;
    let errorCode: string = ErrorCodes.INTERNAL_ERROR;

    if (exception instanceof BusinessError) {
      status = exception.getStatus();
      const raw = exception.getResponse() as any;
      errorCode = raw.errorCode || ErrorCodes.INTERNAL_ERROR;
      clientMessage = raw.message || 'An unexpected error occurred.';
    }
    else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const rawMessage = exception.getResponse();
      clientMessage =
        typeof rawMessage === 'object' && rawMessage !== null && 'message' in (rawMessage as any)
          ? Array.isArray((rawMessage as any).message)
            ? (rawMessage as any).message.join('; ')
            : (rawMessage as any).message
          : rawMessage as string;
    }
    else {
      const prismaError = extractPrismaError(exception);
      if (prismaError) {
        status = prismaError.status;
        clientMessage = prismaError.message;
        errorCode = prismaError.errorCode;
      } else {
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        clientMessage = 'An unexpected error occurred. Please try again later.';
      }
    }

    this.logger.error(
      `[${errorId}] ${method} ${path} - Status: ${status} - Code: ${errorCode} - Message: ${JSON.stringify(clientMessage)}`,
    );
    if (stack) {
      this.logger.error(`[${errorId}] Stack Trace:\n${stack}`);
    }

    response.status(status).json({
      statusCode: status,
      errorCode,
      errorId,
      timestamp,
      message: clientMessage,
    });
  }
}
