import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { captureException } from '../../sentry';
import { redactLogText } from '../utils/redact-log.util';

function prismaErrorCode(exception: unknown): string {
  if (!exception || typeof exception !== 'object' || !('code' in exception)) return '';
  const code = (exception as { code?: unknown }).code;
  return typeof code === 'string' ? code : '';
}

function isUniqueConflict(exception: unknown): boolean {
  return exception instanceof Error && prismaErrorCode(exception) === 'P2002';
}

/** Prisma: bảng/cột không tồn tại — thường do VPS chưa chạy migrate deploy. */
function isPrismaSchemaMismatch(exception: unknown): boolean {
  if (!(exception instanceof Error)) return false;
  const code = prismaErrorCode(exception);
  if (['P2021', 'P2022', 'P2010', 'P2011', 'P2012'].includes(code)) return true;
  const msg = exception.message.toLowerCase();
  return (
    (msg.includes('column') && msg.includes('does not exist')) ||
    (msg.includes('relation') && msg.includes('does not exist')) ||
    msg.includes('custom_field_defs') ||
    msg.includes('custom_fields')
  );
}

function isInfrastructureError(exception: unknown): boolean {
  if (!(exception instanceof Error)) return false;
  const code = prismaErrorCode(exception);
  if (code.startsWith('P') && !['P1001', 'P1002', 'P1008', 'P1011', 'P1017', 'P2024'].includes(code)) {
    return false;
  }
  const msg = exception.message.toLowerCase();
  const name = exception.name.toLowerCase();
  return (
    name.includes('prismaclientinitialization') ||
    name.includes('prismaclientrustpanic') ||
    msg.includes("can't reach database server") ||
    msg.includes('cannot reach database server') ||
    msg.includes('database server is not reachable') ||
    msg.includes('econnrefused') ||
    msg.includes('connection refused') ||
    msg.includes('timed out fetching a new connection from the connection pool') ||
    msg.includes('server has closed the connection') ||
    msg.includes('p1001') ||
    msg.includes('p1002') ||
    msg.includes('p1017') ||
    code === 'P1001' ||
    code === 'P1002' ||
    code === 'P1008' ||
    code === 'P1011' ||
    code === 'P1017' ||
    code === 'P2024'
  );
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: string[] | undefined;
    let code: string | undefined;
    let redirectTo: string | undefined;
    let extra: Record<string, unknown> = {};

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();
      if (typeof body === 'string') {
        message = body;
      } else if (typeof body === 'object' && body !== null) {
        const obj = body as Record<string, unknown>;
        if (Array.isArray(obj.message)) {
          errors = obj.message as string[];
          message = 'Validation failed';
        } else if (typeof obj.message === 'string') {
          message = obj.message;
        } else if (obj.message != null) {
          message = String(obj.message);
        }
        if (typeof obj.code === 'string') code = obj.code;
        if (typeof obj.redirectTo === 'string') redirectTo = obj.redirectTo;
        // Giữ field nghiệp vụ (subscriptionStatus, …) — không lộ stack/secret
        for (const key of ['subscriptionStatus', 'redirectTo', 'code'] as const) {
          if (obj[key] !== undefined && extra[key] === undefined) {
            extra[key] = obj[key];
          }
        }
      }
    } else if (isUniqueConflict(exception)) {
      status = HttpStatus.CONFLICT;
      message = 'Địa chỉ trang đã được dùng. Hãy thử lại.';
      this.logger.warn(redactLogText(exception instanceof Error ? exception.message : String(exception)));
    } else if (isPrismaSchemaMismatch(exception)) {
      status = HttpStatus.SERVICE_UNAVAILABLE;
      message =
        'Cơ sở dữ liệu chưa đồng bộ với phiên bản ứng dụng (thiếu bảng/cột). Trên VPS chạy: pnpm db:migrate:deploy — hoặc migration 20261113100000_work_management_custom_fields.';
      code = 'DB_SCHEMA_OUT_OF_DATE';
      this.logger.error(
        redactLogText(exception instanceof Error ? exception.message : String(exception)),
        exception instanceof Error ? redactLogText(exception.stack) : undefined,
      );
      captureException(exception, 'GlobalExceptionFilter');
    } else if (isInfrastructureError(exception)) {
      status = HttpStatus.SERVICE_UNAVAILABLE;
      message = 'Không kết nối được dữ liệu. Vui lòng thử lại sau ít phút.';
      this.logger.error(
        redactLogText(exception instanceof Error ? exception.message : String(exception)),
        exception instanceof Error ? redactLogText(exception.stack) : undefined,
      );
      captureException(exception, 'GlobalExceptionFilter');
    } else if (exception instanceof Error) {
      this.logger.error(redactLogText(exception.message), redactLogText(exception.stack));
      captureException(exception, 'GlobalExceptionFilter');
    } else {
      this.logger.error('Unknown exception', redactLogText(String(exception)));
      captureException(exception, 'GlobalExceptionFilter');
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      errors,
      ...(code ? { code } : {}),
      ...(redirectTo ? { redirectTo } : {}),
      ...(typeof extra.subscriptionStatus === 'string'
        ? { subscriptionStatus: extra.subscriptionStatus }
        : {}),
      timestamp: new Date().toISOString(),
    });
  }
}
