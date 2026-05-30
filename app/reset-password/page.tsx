"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

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
        if (password.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }

        if (password !== confirm) {
            toast.error('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            const { data, error } = await supabase.auth.updateUser({ password });
            if (error) throw error;
            toast.success('Password updated — you are signed in');
            router.replace('/profile');
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Unable to update password');
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen flex items-center justify-center bg-background">
            <div className="mx-auto w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-xl">
                <h1 className="text-2xl font-bold text-foreground">Reset your password</h1>
                <p className="mt-2 text-sm text-muted-foreground">Enter a new password for your account.</p>

                <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-muted-foreground">New password</label>
                        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-muted-foreground">Confirm password</label>
                        <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={8} />
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Updating…' : 'Update password'}
                    </Button>
                </form>
            </div>
        </main>
    );
}
