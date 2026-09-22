'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import PasswordRequirements, {
  evaluatePasswordRequirements,
} from '@/components/auth/PasswordRequirements'
import PasswordField from '@/components/auth/PasswordField'
import { Field, FieldLabel } from '@/components/ui/field'
import Container from '@/components/shared/Container'
import DashedGrid from '@/components/shared/DashedGrid'
import Logo from '@/components/layout/Logo'
import { PASSWORD_ERRORS } from '@/lib/messages'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const passwordRequirements = evaluatePasswordRequirements(password, confirm)

  useEffect(() => {
    // Check if user is signed in; if not, redirect to sign-in
    const ensureUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        // Not signed in — send to sign-in so auth link can be re-used
        router.replace('/sign-in')
      }
    }

    ensureUser()
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!passwordRequirements.isStrong) {
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      toast.success('Password updated - you are signed in')
      router.replace('/profile')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : PASSWORD_ERRORS.failedToUpdatePassword)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative isolate overflow-hidden bg-background text-foreground">
      {/* Background dashed grid */}
      <DashedGrid absolute zIndex={-1} opacity={0.4} />

      {/* Ambient glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-150 w-full max-w-5xl -translate-x-1/2 rounded-full bg-accent/5 blur-3xl" />

      <Container className="relative flex min-h-screen items-center justify-center py-16">
        <div className="w-full max-w-md space-y-6">
          <div className="flex justify-center">
            <Logo />
          </div>

          <div className="w-full rounded-4xl border border-border/60 bg-card/80 p-7 backdrop-blur-xl shadow-[0_30px_80px_-40px_rgba(0,0,0,0.18)] sm:p-8">
            <h1 className="text-3xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-4xl">
              Reset your password
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Enter a new password for your account.
            </p>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <Field>
                <FieldLabel htmlFor="new-password">New password</FieldLabel>
                <PasswordField
                  id="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  aria-invalid={!passwordRequirements.isStrong}
                  aria-describedby="reset-password-feedback"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="confirm-password">Confirm password</FieldLabel>
                <PasswordField
                  id="confirm-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  aria-invalid={confirm.length > 0 && confirm !== password}
                  aria-describedby="reset-password-feedback"
                />
              </Field>

              <PasswordRequirements
                id="reset-password-feedback"
                mode="reset-password"
                password={password}
                confirmPassword={confirm}
              />

              <Button
                type="submit"
                size="lg"
                className="h-11 w-full cursor-pointer"
                disabled={loading || !passwordRequirements.isStrong}
              >
                {loading ? 'Updating…' : 'Update password'}
              </Button>
            </form>
          </div>
        </div>
      </Container>
    </div>
  )
}
