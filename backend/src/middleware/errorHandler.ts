import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public isOperational = true
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
    return;
  }

  // Prisma known errors
  if (err.constructor.name === 'PrismaClientKnownRequestError') {
    const prismaErr = err as unknown as { code: string; meta?: { cause?: string } };
    if (prismaErr.code === 'P2025') {
      res.status(404).json({ success: false, error: 'Record not found' });
      return;
    }
    if (prismaErr.code === 'P2002') {
      res.status(409).json({ success: false, error: 'Record already exists' });
      return;
    }
  }

  console.error('[ERROR]', err);

  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
}
