"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import PasswordRequirements, { evaluatePasswordRequirements } from '@/components/auth/PasswordRequirements';
import PasswordField from '@/components/auth/PasswordField';
import DashedGrid from '@/components/shared/DashedGrid';

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const passwordRequirements = evaluatePasswordRequirements(password, confirm);

    useEffect(() => {
        // Check if user is signed in; if not, redirect to sign-in
        const ensureUser = async () => {
            const { data } = await supabase.auth.getUser();
            if (!data.user) {
                // Not signed in — send to sign-in so auth link can be re-used
                router.replace('/sign-in');
            }
        };

        ensureUser();
    }, [router]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!passwordRequirements.isStrong) {
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({ password });
            if (error) throw error;
            toast.success('Password updated - you are signed in');
            router.replace('/profile');
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Unable to update password');
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
            {/* Background dashed grid */}
            <DashedGrid absolute zIndex={-1} opacity={0.5} />

            <div className="mx-auto w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-xl relative z-10">
                <h1 className="text-2xl font-bold text-foreground">Reset your password</h1>
                <p className="mt-2 text-sm text-muted-foreground">Enter a new password for your account.</p>

                <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-muted-foreground">New password</label>
                        <PasswordField
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={8}
                            aria-invalid={!passwordRequirements.isStrong}
                            aria-describedby="reset-password-feedback"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-muted-foreground">Confirm password</label>
                        <PasswordField
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            required
                            minLength={8}
                            aria-invalid={confirm.length > 0 && confirm !== password}
                            aria-describedby="reset-password-feedback"
                        />
                    </div>

                    <PasswordRequirements
                        id="reset-password-feedback"
                        mode="reset-password"
                        password={password}
                        confirmPassword={confirm}
                    />

                    <Button type="submit" className="w-full" disabled={loading || !passwordRequirements.isStrong}>
                        {loading ? 'Updating…' : 'Update password'}
                    </Button>
                </form>
            </div>
        </main>
    );
}
