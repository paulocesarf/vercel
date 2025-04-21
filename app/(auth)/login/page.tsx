"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Loader2 } from "lucide-react"
import ReCAPTCHA from "react-google-recaptcha"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase/client"

const formSchema = z.object({
  username: z.string().min(1, {
    message: "Username is required.",
  }),
  password: z.string().min(1, {
    message: "Password is required.",
  }),
})

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  })

  const handleRecaptchaChange = (token: string | null) => {
    setRecaptchaToken(token)
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    setError(null)

    try {
      // Verify reCAPTCHA
      if (!recaptchaToken) {
        throw new Error("Please complete the CAPTCHA")
      }

      // Verify reCAPTCHA token with Google's API
      const recaptchaResponse = await fetch('/api/verify-recaptcha', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: recaptchaToken }),
      })

      const recaptchaData = await recaptchaResponse.json()
      if (!recaptchaData.success) {
        throw new Error("CAPTCHA verification failed")
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: `${values.username}@example.com`,
        password: values.password,
      })

      if (error) {
        throw error
      }

      router.push("/dashboard")
      router.refresh()
    } catch (error: any) {
      setError(error.message || "Invalid username or password. Please try again.")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center gradient-bg p-4">
      <div className="w-full max-w-md space-y-10">
        {/* Title and Subtitle */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Sign In</h1>
          <p className="text-white/70 mt-2">Sign in to access all features.</p>
        </div>

        <div className="bg-black/40 p-10 rounded-xl backdrop-blur-md border border-white/20 shadow-lg">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white text-sm font-medium">Username</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Your username"
                        {...field}
                        className="bg-black/50 border-white/20 text-white focus:ring-2 focus:ring-primary focus:outline-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white text-sm font-medium">Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Your password"
                        {...field}
                        className="bg-black/50 border-white/20 text-white focus:ring-2 focus:ring-primary focus:outline-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-center">
                <ReCAPTCHA
                  sitekey="6LdX8x4rAAAAAN1rku7gve2EvBungLQ2T_QhbFst"
                  onChange={handleRecaptchaChange}
                />
              </div>

              {error && <div className="text-red-400 text-sm font-medium text-center">{error}</div>}

              <Button
                type="submit"
                className="w-full py-3 text-lg font-semibold rounded-lg transition-transform transform hover:scale-105"
                variant="gradient"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>

              <div className="text-center text-sm text-white/70">
                You don't have an account yet?{" "}
                <Link href="/register" className="text-primary font-medium hover:underline">
                  Sign up
                </Link>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}