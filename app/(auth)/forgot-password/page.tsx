'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { Field, FieldLabel } from '@/components/ui/field';
import Container from '@/components/shared/Container';
import DashedGrid from '@/components/shared/DashedGrid';
import Logo from '@/components/layout/Logo';
import { PASSWORD_ERRORS } from '@/lib/messages';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) throw error;

            // Redirect to check-email page with context
            router.replace(`/check-email?type=forgot-password&email=${encodeURIComponent(email)}`);

            toast.info('Check your email for password reset instructions.');
        } catch (err) {
            toast.error(err instanceof Error ? err.message : PASSWORD_ERRORS.failedToSendResetEmail);
        } finally {
            setLoading(false);
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
                            Forgot your password?
                        </h1>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                            Enter the email on your account and we&apos;ll send a link to reset your password.
                        </p>

                        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                            <Field>
                                <FieldLabel htmlFor="email">Email</FieldLabel>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    autoComplete="email"
                                    required
                                    className="h-11 rounded-full border-border/60 bg-muted/20"
                                />
                            </Field>

                            <Button
                                type="submit"
                                size="lg"
                                className="h-11 w-full cursor-pointer"
                                disabled={loading}
                            >
                                {loading ? 'Sending…' : 'Send reset link'}
                            </Button>
                        </form>

                        <p className="mt-6 text-center text-xs text-muted-foreground">
                            Remembered your password?{' '}
                            <Link href="/sign-in" className="font-medium text-accent underline-offset-4 hover:underline">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </Container>
        </div>
    );
}
