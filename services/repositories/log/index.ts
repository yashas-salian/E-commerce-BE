// logger.ts - TypeScript Auto-logging middleware with distributed tracing
import winston from 'winston';
import { v4 as uuidv4 } from 'uuid';
import type{ Request, Response, NextFunction } from 'express';

// Types
interface TraceContext {
  traceId: string;
  spanId: string;
  parentSpanId: string | null;
  serviceName: string;
}

interface ExtendedRequest extends Request {
  traceContext?: TraceContext;
  logger?: winston.Logger;
}

interface KafkaMessageWithTrace {
  _trace?: {
    traceId: string;
    spanId: string;
    serviceName: string;
    timestamp: number;
  };
  [key: string]: any;
}

interface KafkaProducerParams {
  topic: string;
  messages: Array<{
    key?: string | Buffer | null;
    value: string | Buffer;
    headers?: Record<string, string | Buffer>;
    partition?: number;
    timestamp?: string;
  }>;
  acks?: number;
  timeout?: number;
  compression?: number;
}


// Winston logger configuration
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          const traceInfo = meta.traceId ? `[${(meta.traceId as string).slice(0, 8)}]` : '';
          const metaStr = Object.keys(meta).length > 0 ? JSON.stringify(meta) : '';
          return `${timestamp} ${level} ${traceInfo} ${message} ${metaStr}`;
        })
      ),
    }),
    new winston.transports.File({
      filename: 'logs/app.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// Sanitize sensitive data
const sanitize = <T extends Record<string, any>>(obj: T): T => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const sensitive = ['password', 'token', 'apiKey', 'authorization', 'creditCard', 'cvv', 'ssn'];
  const sanitized = Array.isArray(obj) ? ([...obj] as unknown as T) : ({ ...obj } as T);
  
  for (const key in sanitized) {
    if (sensitive.some(s => key.toLowerCase().includes(s))) {
      (sanitized as any)[key] = '***REDACTED***';
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitize(sanitized[key]);
    }
  }
  
  return sanitized;
};

// Main middleware function
export const autoLogger = (serviceName: string = 'service') => {
  return (req: ExtendedRequest, res: Response, next: NextFunction): void => {
    // Generate or extract trace context
    const traceId = (req.headers['x-trace-id'] as string) || uuidv4();
    const spanId = uuidv4();
    const parentSpanId = (req.headers['x-span-id'] as string) || null;

    // Attach to request for downstream use
    req.traceContext = { traceId, spanId, parentSpanId, serviceName };
    req.logger = logger;

    // Set response headers
    res.setHeader('x-trace-id', traceId);
    res.setHeader('x-span-id', spanId);

    const startTime = Date.now();

    // Log incoming request
    logger.info('HTTP Request', {
      traceId,
      spanId,
      parentSpanId,
      serviceName,
      method: req.method,
      url: req.originalUrl,
      ip: req.ip || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
      body: sanitize(req.body || {}),
      query: req.query,
    });

    // Intercept response
    const originalSend = res.send.bind(res);
    const originalJson = res.json.bind(res);

    res.send = function (data: any): Response {
      const duration = Date.now() - startTime;
      
      logger.info('HTTP Response', {
        traceId,
        spanId,
        serviceName,
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        responseSize: Buffer.byteLength(data || ''),
      });

      return originalSend(data);
    };

    res.json = function (data: any): Response {
      const duration = Date.now() - startTime;
      
      logger.info('HTTP Response', {
        traceId,
        spanId,
        serviceName,
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
      });

      return originalJson(data);
    };

    // Handle errors
    res.on('finish', () => {
      if (res.statusCode >= 400) {
        logger.warn('HTTP Error Response', {
          traceId,
          spanId,
          serviceName,
          method: req.method,
          url: req.originalUrl,
          statusCode: res.statusCode,
          duration: `${Date.now() - startTime}ms`,
        });
      }
    });

    next();
  };
};


// Global error handler (optional - use with Express)
export const errorLogger = (serviceName: string = 'service') => {
  return (err: Error & { status?: number }, req: ExtendedRequest, res: Response, next: NextFunction): void => {
    logger.error('Unhandled Error', {
      traceId: req.traceContext?.traceId,
      spanId: req.traceContext?.spanId,
      serviceName,
      method: req.method,
      url: req.originalUrl,
      error: err.message,
      stack: err.stack,
    });

    res.status(err.status || 500).json({
      error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
      traceId: req.traceContext?.traceId,
    });
  };
};

// Export logger instance
export { logger };

// Default export
export default {
  autoLogger,
  errorLogger,
  logger,
};