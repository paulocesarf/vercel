import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { rateLimit } from '@/lib/rate-limit';
import { verifyCsrfToken } from '@/lib/csrf';
import pino from 'pino';
import { z } from 'zod';

const logger = pino({ level: 'info' });

// Esquema de validação
const methodSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1).regex(/^[a-zA-Z0-9\s]+$/, {
    message: 'Name can only contain letters, numbers, and spaces.',
  }),
  description: z.string().max(500).nullable(),
  api_endpoint: z.string().url().refine(
    (val) => val.includes('{HOST}') && val.includes('{PORT}') && val.includes('{TIME}'),
    { message: 'API endpoint must include {HOST}, {PORT}, and {TIME} placeholders.' }
  ),
  csrfToken: z.string(),
});

export async function POST(request: Request) {
  try {
    // Rate limiting: 5 requisições por IP em 1 minuto
    const { success, limit, remaining } = await rateLimit(request, { max: 5, windowMs: 60 * 1000 });
    if (!success) {
      logger.warn({ ip: request.headers.get('x-forwarded-for') }, 'Rate limit exceeded for admin methods');
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: { 'X-RateLimit-Limit': limit, 'X-RateLimit-Remaining': remaining } }
      );
    }

    const body = await request.json();
    const parsed = methodSchema.safeParse(body);
    if (!parsed.success) {
      logger.warn({ errors: parsed.error.errors }, 'Invalid input for admin methods');
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const { id, name, description, api_endpoint, csrfToken } = parsed.data;

    // Validar CSRF
    if (!verifyCsrfToken(csrfToken, csrfToken)) {
      logger.warn({ ip: request.headers.get('x-forwarded-for') }, 'Invalid CSRF token');
      return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
    }

    // Verificar autenticação
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      logger.warn({ ip: request.headers.get('x-forwarded-for') }, 'Unauthorized attempt to admin methods');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verificar se é admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('username, role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || profile.role !== 'admin' || !['Hypexx', 'tcpnfo'].includes(profile.username)) {
      logger.warn({ userId: user.id }, 'Non-admin attempted to manage methods');
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Validar unicidade de name
    const { data: existingMethod, error: existingError } = await supabase
      .from('attack_methods')
      .select('id')
      .eq('name', name)
      .neq('id', id || '')
      .single();

    if (existingError && existingError.code !== 'PGRST116') {
      logger.error({ error: existingError }, 'Failed to check method name uniqueness');
      return NextResponse.json({ error: 'Failed to validate method name' }, { status: 500 });
    }
    if (existingMethod) {
      logger.warn({ name }, 'Method name already exists');
      return NextResponse.json({ error: 'Method name already exists' }, { status: 400 });
    }

    if (id) {
      // Atualizar método
      const updates = {
        name,
        description: description || null,
        api_endpoint,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('attack_methods').update(updates).eq('id', id);
      if (error) {
        logger.error({ error }, 'Failed to update method');
        return NextResponse.json({ error: 'Failed to update method' }, { status: 500 });
      }

      logger.info({ methodId: id, name }, 'Method updated successfully');
      return NextResponse.json({ success: true, message: 'Method updated successfully' });
    } else {
      // Criar método
      const { error } = await supabase.from('attack_methods').insert([
        {
          name,
          description: description || null,
          api_endpoint,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);
      if (error) {
        logger.error({ error }, 'Failed to create method');
        return NextResponse.json({ error: 'Failed to create method' }, { status: 500 });
      }

      logger.info({ name }, 'Method created successfully');
      return NextResponse.json({ success: true, message: 'Method created successfully' });
    }
  } catch (error) {
    logger.error({ error }, 'Admin methods error');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    // Rate limiting: 5 requisições por IP em 1 minuto
    const { success, limit, remaining } = await rateLimit(request, { max: 5, windowMs: 60 * 1000 });
    if (!success) {
      logger.warn({ ip: request.headers.get('x-forwarded-for') }, 'Rate limit exceeded for admin methods delete');
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
      logger.warn({ ip: request.headers.get('x-forwarded-for') }, 'Unauthorized attempt to delete method');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verificar se é admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('username, role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || profile.role !== 'admin' || !['Hypexx', 'tcpnfo'].includes(profile.username)) {
      logger.warn({ userId: user.id }, 'Non-admin attempted to delete method');
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Verificar se método existe
    const { data: targetMethod, error: targetError } = await supabase
      .from('attack_methods')
      .select('id')
      .eq('id', id)
      .single();

    if (targetError || !targetMethod) {
      logger.warn({ methodId: id }, 'Method not found for deletion');
      return NextResponse.json({ error: 'Method not found' }, { status: 404 });
    }

    // Verificar se método está em uso
    const { data: attacksWithMethod, error: checkError } = await supabase
      .from('attack_history')
      .select('id')
      .eq('method_id', id);

    if (checkError) {
      logger.error({ error: checkError }, 'Failed to check method usage');
      return NextResponse.json({ error: 'Failed to check method usage' }, { status: 500 });
    }
    if (attacksWithMethod && attacksWithMethod.length > 0) {
      logger.warn({ methodId: id }, 'Method in use by attacks');
      return NextResponse.json(
        { error: `Cannot delete method because it is used in ${attacksWithMethod.length} attack(s).` },
        { status: 400 }
      );
    }

    // Excluir método
    const { error } = await supabase.from('attack_methods').delete().eq('id', id);
    if (error) {
      logger.error({ error }, 'Failed to delete method');
      return NextResponse.json({ error: 'Failed to delete method' }, { status: 500 });
    }

    logger.info({ methodId: id }, 'Method deleted successfully');
    return NextResponse.json({ success: true, message: 'Method deleted successfully' });
  } catch (error) {
    logger.error({ error }, 'Admin methods delete error');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}