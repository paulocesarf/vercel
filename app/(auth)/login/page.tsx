// app/login/page.tsx
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { createCsrfToken } from '@/lib/csrf'
import { createClient } from '@/lib/supabase/server'
import LoginFormClient from './LoginFormClient'
import { Loader2 } from 'lucide-react'

export default async function LoginPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) return redirect('/dashboard')

  // Generate and pass the encrypted token
  const csrfToken = await createCsrfToken()

  return (
    <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin" />}>
      <LoginFormClient csrfToken={csrfToken} />
    </Suspense>
  )
}