'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import DashedGrid from '@/components/shared/DashedGrid';
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
        <main className="flex min-h-screen justify-center items-center bg-background relative overflow-hidden">
            {/* Background dashed grid */}
            <DashedGrid absolute zIndex={-1} opacity={0.5} />

            <div className="mx-auto max-w-md relative z-10">
                <div className="w-full rounded-4xl border border-border bg-card p-7 shadow-xl dark:shadow-black/40 sm:p-8">
                    <h2 className="mb-2 text-xl font-bold tracking-tight text-foreground">Forgot your password?</h2>
                    <p className="mb-6 text-sm text-muted-foreground">Enter your account email and we&apos;ll send password reset instructions.</p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="mb-2 block text-sm font-medium text-muted-foreground">Email</label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="h-10"
                            />
                        </div>

                        <Button type="submit" className="h-10 w-full rounded-xl font-semibold" disabled={loading}>
                            {loading ? 'Sending…' : 'Send reset email'}
                        </Button>
                    </form>

                    <p className="mt-6 text-center text-sm text-muted-foreground">
                        Remembered your password?{' '}
                        <Link href="/sign-in" className="font-medium text-foreground underline-offset-4 hover:underline">Sign in</Link>
                    </p>
                </div>
            </div>
        </main>
    );
}
