import { NextResponse } from 'next/server';
import pino from 'pino';
import { rateLimit } from '@/lib/rate-limit';
import { verifyCsrfToken } from '@/lib/csrf';
import { z } from 'zod';

const logger = pino({ level: 'info' });

// Esquema de validação
const verifySchema = z.object({
  token: z.string().min(1, { message: 'No token provided' }),
  action: z.enum(['login', 'register'], { message: 'Invalid action' }),
  csrfToken: z.string(),
});

export async function POST(request: Request) {
  try {
    // Rate limiting: 10 requisições por IP em 1 minuto
    const { success, limit, remaining } = await rateLimit(request, { max: 10, windowMs: 60 * 1000 });
    if (!success) {
      logger.warn({ ip: request.headers.get('x-forwarded-for') }, 'Rate limit exceeded for verify-captcha');
      return NextResponse.json(
        { success: false, error: 'Too many requests' },
        { status: 429, headers: { 'X-RateLimit-Limit': limit, 'X-RateLimit-Remaining': remaining } }
      );
    }

    const body = await request.json();
    const parsed = verifySchema.safeParse(body);
    if (!parsed.success) {
      logger.warn({ errors: parsed.error.errors }, 'Invalid input for verify-captcha');
      return NextResponse.json({ success: false, error: 'Invalid input' }, { status: 400 });
    }

    const { token, action, csrfToken } = parsed.data;

    // Validar CSRF
    if (!verifyCsrfToken(csrfToken, csrfToken)) {
      logger.warn({ ip: request.headers.get('x-forwarded-for') }, 'Invalid CSRF token in verify-captcha');
      return NextResponse.json({ success: false, error: 'Invalid CSRF token' }, { status: 403 });
    }

    // Verificar reCAPTCHA com Google
    const recaptchaResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}&remoteip=${request.headers.get('x-forwarded-for') || ''}`,
    });

    const recaptchaData = await recaptchaResponse.json();
    if (!recaptchaData.success || recaptchaData.action !== action || recaptchaData.score < 0.5) {
      logger.warn({ ip: request.headers.get('x-forwarded-for'), action }, 'reCAPTCHA verification failed');
      return NextResponse.json({ success: false, error: 'CAPTCHA verification failed' }, { status: 400 });
    }

    logger.info({ ip: request.headers.get('x-forwarded-for'), action }, 'reCAPTCHA verified successfully');
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error({ error }, 'reCAPTCHA verification error');
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}