// app/api/auth/login/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateCsrfToken } from '@/lib/csrf'
import { rateLimit } from '@/lib/rate-limit'
import pino from 'pino'

const logger = pino()

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  
  // Rate limiting
  const { success } = await rateLimit(ip, { max: 5, windowMs: 60 * 1000 })
  if (!success) {
    logger.warn({ ip }, 'Rate limit exceeded')
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  try {
    const body = await request.json()
    logger.debug({ body }, 'Received login request')
    
    // CSRF validation with detailed logging
    const csrfValid = validateCsrfToken(body.csrfToken)
    logger.debug({ csrfValid, receivedToken: body.csrfToken }, 'CSRF validation result')
    
    if (!csrfValid) {
      logger.warn('Invalid CSRF token')
      return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email: body.username.includes('@') ? body.username : `${body.username}@example.com`,
      password: body.password,
    })

    if (error) throw error

    logger.info({ userId: data.user?.id }, 'Login successful')
    return NextResponse.json({ success: true })
  } catch (error: any) {
    logger.error({ error: error.message }, 'Login failed')
    return NextResponse.json(
      { error: error.message || 'Login failed' }, 
      { status: 400 }
    )
  }
}