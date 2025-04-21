import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { rateLimit } from '@/lib/rate-limit';
import { verifyCsrfToken } from '@/lib/csrf';
import pino from 'pino';
import { z } from 'zod';

const logger = pino({ level: 'info' });

// Esquema de validação
const userSchema = z.object({
  id: z.string().optional(),
  username: z.string().min(3).regex(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can only contain letters, numbers, and underscores.',
  }),
  password: z.string().min(6).optional().or(z.literal('')),
  role: z.enum(['user', 'admin']),
  plan_id: z.string().nullable(),
  csrfToken: z.string(),
});

export async function POST(request: Request) {
  try {
    // Rate limiting: 5 requisições por IP em 1 minuto
    const { success, limit, remaining } = await rateLimit(request, { max: 5, windowMs: 60 * 1000 });
    if (!success) {
      logger.warn({ ip: request.headers.get('x-forwarded-for') }, 'Rate limit exceeded for admin users');
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: { 'X-RateLimit-Limit': limit, 'X-RateLimit-Remaining': remaining } }
      );
    }

    const body = await request.json();
    const parsed = userSchema.safeParse(body);
    if (!parsed.success) {
      logger.warn({ errors: parsed.error.errors }, 'Invalid input for admin users');
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const { id, username, password, role, plan_id, csrfToken } = parsed.data;

    // Validar CSRF
    if (!verifyCsrfToken(csrfToken, csrfToken)) {
      logger.warn({ ip: request.headers.get('x-forwarded-for') }, 'Invalid CSRF token');
      return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
    }

    // Verificar autenticação
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      logger.warn({ ip: request.headers.get('x-forwarded-for') }, 'Unauthorized attempt to admin users');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verificar se é admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('username, role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || profile.role !== 'admin' || !['Hypexx', 'tcpnfo'].includes(profile.username)) {
      logger.warn({ userId: user.id }, 'Non-admin attempted to manage users');
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Validar unicidade de username
    const { data: existingUser, error: existingError } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .neq('id', id || '')
      .single();

    if (existingError && existingError.code !== 'PGRST116') {
      logger.error({ error: existingError }, 'Failed to check username uniqueness');
      return NextResponse.json({ error: 'Failed to validate username' }, { status: 500 });
    }
    if (existingUser) {
      logger.warn({ username }, 'Username already exists');
      return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
    }

    // Buscar plano, se fornecido
    let planData = null;
    if (plan_id) {
      const { data, error } = await supabase.from('plans').select('*').eq('id', plan_id).single();
      if (error || !data) {
        logger.error({ error }, 'Failed to fetch plan');
        return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
      }
      planData = data;
    }

    if (id) {
      // Atualizar usuário
      const updates: any = {
        username,
        role,
        plan_id: plan_id || null,
        max_time: planData ? planData.max_time : 0,
        max_concurrent_attacks: planData ? planData.max_concurrent_attacks : 1,
      };

      const { error } = await supabase.from('profiles').update(updates).eq('id', id);
      if (error) {
        logger.error({ error }, 'Failed to update user');
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
      }

      // Atualizar senha, se fornecida
      if (password) {
        const { error } = await supabase.auth.admin.updateUserById(id, { password });
        if (error) {
          logger.error({ error }, 'Failed to update password');
          return NextResponse.json({ error: 'Failed to update password' }, { status: 500 });
        }
      }

      logger.info({ userId: id, username }, 'User updated successfully');
      return NextResponse.json({ success: true, message: 'User updated successfully' });
    } else {
      // Criar usuário
      if (!password) {
        logger.warn({ username }, 'Password required for new user');
        return NextResponse.json({ error: 'Password is required for new user' }, { status: 400 });
      }

      const { data, error } = await supabase.auth.admin.createUser({
        email: `${username}@example.com`,
        password,
        email_confirm: true,
      });

      if (error || !data.user) {
        logger.error({ error }, 'Failed to create user');
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
      }

      const profileData: any = {
        id: data.user.id,
        username,
        role,
        plan_id: plan_id || null,
        max_time: planData ? planData.max_time : 0,
        max_concurrent_attacks: planData ? planData.max_concurrent_attacks : 1,
      };

      const { error: profileError } = await supabase.from('profiles').insert([profileData]);
      if (profileError) {
        logger.error({ error: profileError }, 'Failed to create profile');
        await supabase.auth.admin.deleteUser(data.user.id);
        return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 });
      }

      logger.info({ userId: data.user.id, username }, 'User created successfully');
      return NextResponse.json({ success: true, message: 'User created successfully' });
    }
  } catch (error) {
    logger.error({ error }, 'Admin users error');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    // Rate limiting: 5 requisições por IP em 1 minuto
    const { success, limit, remaining } = await rateLimit(request, { max: 5, windowMs: 60 * 1000 });
    if (!success) {
      logger.warn({ ip: request.headers.get('x-forwarded-for') }, 'Rate limit exceeded for admin users delete');
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: { 'X-RateLimit-Limit': limit, 'X-RateLimit-Remaining': remaining } }
      );
    }

    const { id, csrfToken } = await request.json();
    if (!id || !csrfToken) {
      logger.warn({ ip: request.headers.get('x-forwarded-for') }, 'Missing id or CSRF token');
      return NextResponse.json({ error: 'Missing id or CSRF token' }, { status: 400 });
    }

    // Validar CSRF
    if (!verifyCsrfToken(csrfToken, csrfToken)) {
      logger.warn({ ip: request.headers.get('x-forwarded-for') }, 'Invalid CSRF token');
      return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
    }

    // Verificar autenticação
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      logger.warn({ ip: request.headers.get('x-forwarded-for') }, 'Unauthorized attempt to delete user');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verificar se é admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('username, role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || profile.role !== 'admin' || !['Hypexx', 'tcpnfo'].includes(profile.username)) {
      logger.warn({ userId: user.id }, 'Non-admin attempted to delete user');
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Verificar se usuário existe
    const { data: targetUser, error: targetError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', id)
      .single();

    if (targetError || !targetUser) {
      logger.warn({ userId: id }, 'User not found for deletion');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Impedir exclusão do próprio usuário
    if (id === user.id) {
      logger.warn({ userId: id }, 'Admin attempted to delete own account');
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 403 });
    }

    // Excluir usuário
    const { error } = await supabase.auth.admin.deleteUser(id);
    if (error) {
      logger.error({ error }, 'Failed to delete user');
      return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }

    logger.info({ userId: id }, 'User deleted successfully');
    return NextResponse.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    logger.error({ error }, 'Admin users delete error');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}