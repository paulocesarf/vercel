import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { rateLimit } from '@/lib/rate-limit';
import { verifyCsrfToken } from '@/lib/csrf';
import pino from 'pino';
import { z } from 'zod';

const logger = pino({ level: 'info' });

// Esquema de validação
const planSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1).regex(/^[a-zA-Z0-9\s]+$/, {
    message: 'Name can only contain letters, numbers, and spaces.',
  }),
  max_concurrent_attacks: z.number().int().min(1).max(100),
  max_time: z.number().int().min(1).max(3600),
  price: z.number().min(0).max(10000),
  csrfToken: z.string(),
});

export async function POST(request: Request) {
  try {
    // Rate limiting: 5 requisições por IP em 1 minuto
    const { success, limit, remaining } = await rateLimit(request, { max: 5, windowMs: 60 * 1000 });
    if (!success) {
      logger.warn({ ip: request.headers.get('x-forwarded-for') }, 'Rate limit exceeded for admin plans');
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: { 'X-RateLimit-Limit': limit, 'X-RateLimit-Remaining': remaining } }
      );
    }

    const body = await request.json();
    const parsed = planSchema.safeParse(body);
    if (!parsed.success) {
      logger.warn({ errors: parsed.error.errors }, 'Invalid input for admin plans');
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const { id, name, max_concurrent_attacks, max_time, price, csrfToken } = parsed.data;

    // Validar CSRF
    if (!verifyCsrfToken(csrfToken, csrfToken)) {
      logger.warn({ ip: request.headers.get('x-forwarded-for') }, 'Invalid CSRF token');
      return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
    }

    // Verificar autenticação
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      logger.warn({ ip: request.headers.get('x-forwarded-for') }, 'Unauthorized attempt to admin plans');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verificar se é admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('username, role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || profile.role !== 'admin' || !['Hypexx', 'tcpnfo'].includes(profile.username)) {
      logger.warn({ userId: user.id }, 'Non-admin attempted to manage plans');
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Validar unicidade de name
    const { data: existingPlan, error: existingError } = await supabase
      .from('plans')
      .select('id')
      .eq('name', name)
      .neq('id', id || '')
      .single();

    if (existingError && existingError.code !== 'PGRST116') {
      logger.error({ error: existingError }, 'Failed to check plan name uniqueness');
      return NextResponse.json({ error: 'Failed to validate plan name' }, { status: 500 });
    }
    if (existingPlan) {
      logger.warn({ name }, 'Plan name already exists');
      return NextResponse.json({ error: 'Plan name already exists' }, { status: 400 });
    }

    if (id) {
      // Atualizar plano
      const updates = {
        name,
        max_concurrent_attacks,
        max_time,
        price,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('plans').update(updates).eq('id', id);
      if (error) {
        logger.error({ error }, 'Failed to update plan');
        return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 });
      }

      // Atualizar perfis associados
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ max_time, max_concurrent_attacks })
        .eq('plan_id', id);
      if (profileError) {
        logger.error({ error: profileError }, 'Failed to update associated profiles');
        return NextResponse.json({ error: 'Failed to update associated profiles' }, { status: 500 });
      }

      logger.info({ planId: id, name }, 'Plan updated successfully');
      return NextResponse.json({ success: true, message: 'Plan updated successfully' });
    } else {
      // Criar plano
      const { error } = await supabase.from('plans').insert([
        {
          name,
          max_concurrent_attacks,
          max_time,
          price,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);
      if (error) {
        logger.error({ error }, 'Failed to create plan');
        return NextResponse.json({ error: 'Failed to create plan' }, { status: 500 });
      }

      logger.info({ name }, 'Plan created successfully');
      return NextResponse.json({ success: true, message: 'Plan created successfully' });
    }
  } catch (error) {
    logger.error({ error }, 'Admin plans error');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    // Rate limiting: 5 requisições por IP em 1 minuto
    const { success, limit, remaining } = await rateLimit(request, { max: 5, windowMs: 60 * 1000 });
    if (!success) {
      logger.warn({ ip: request.headers.get('x-forwarded-for') }, 'Rate limit exceeded for admin plans delete');
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
      logger.warn({ ip: request.headers.get('x-forwarded-for') }, 'Unauthorized attempt to delete plan');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verificar se é admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('username, role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || profile.role !== 'admin' || !['Hypexx', 'tcpnfo'].includes(profile.username)) {
      logger.warn({ userId: user.id }, 'Non-admin attempted to delete plan');
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Verificar se plano existe
    const { data: targetPlan, error: targetError } = await supabase
      .from('plans')
      .select('id')
      .eq('id', id)
      .single();

    if (targetError || !targetPlan) {
      logger.warn({ planId: id }, 'Plan not found for deletion');
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // Verificar se plano está em uso
    const { data: usersWithPlan, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('plan_id', id);

    if (checkError) {
      logger.error({ error: checkError }, 'Failed to check plan usage');
      return NextResponse.json({ error: 'Failed to check plan usage' }, { status: 500 });
    }
    if (usersWithPlan && usersWithPlan.length > 0) {
      logger.warn({ planId: id }, 'Plan in use by users');
      return NextResponse.json(
        { error: `Cannot delete plan because it is assigned to ${usersWithPlan.length} user(s).` },
        { status: 400 }
      );
    }

    // Excluir plano
    const { error } = await supabase.from('plans').delete().eq('id', id);
    if (error) {
      logger.error({ error }, 'Failed to delete plan');
      return NextResponse.json({ error: 'Failed to delete plan' }, { status: 500 });
    }

    logger.info({ planId: id }, 'Plan deleted successfully');
    return NextResponse.json({ success: true, message: 'Plan deleted successfully' });
  } catch (error) {
    logger.error({ error }, 'Admin plans delete error');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}