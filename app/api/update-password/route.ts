import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { rateLimit } from '@/lib/rate-limit';
import { verifyCsrfToken } from '@/lib/csrf';
import pino from 'pino';

const logger = pino({ level: 'info' });

export async function POST(request: Request) {
  try {
    // Rate limiting: 5 tentativas por IP em 10 minutos
    const { success, limit, remaining } = await rateLimit(request, { max: 50, windowMs: 10 * 60 * 1000 });
    if (!success) {
      logger.warn({ ip: request.headers.get('x-forwarded-for') }, 'Rate limit exceeded for password update');
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: { 'X-RateLimit-Limit': limit, 'X-RateLimit-Remaining': remaining } }
      );
    }

    const { currentPassword, newPassword, csrfToken } = await request.json();

    // Validar CSRF
    if (!verifyCsrfToken(csrfToken, csrfToken)) {
      logger.warn({ ip: request.headers.get('x-forwarded-for') }, 'Invalid CSRF token');
      return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
    }

    // Verificar autenticação
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      logger.warn({ ip: request.headers.get('x-forwarded-for') }, 'Unauthorized password update attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verificar senha atual
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword,
    });

    if (signInError) {
      logger.warn({ ip: request.headers.get('x-forwarded-for'), userId: user.id }, 'Incorrect current password');
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
    }

    // Atualizar senha
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      logger.error({ error: updateError, userId: user.id }, 'Failed to update password');
      return NextResponse.json({ error: 'Failed to update password' }, { status: 500 });
    }

    logger.info({ userId: user.id }, 'Password updated successfully');
    return NextResponse.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    logger.error({ error }, 'Password update error');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}