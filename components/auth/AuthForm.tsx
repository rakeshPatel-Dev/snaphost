'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/lib/supabase';
import UsernameAvailability from '@/components/auth/UsernameAvailability';
import { useUsernameAvailability } from '@/lib/useUsernameAvailability';
import { Field, FieldLabel } from '../ui/field';
import {
    RiMailLine,
    RiLockPasswordLine,
    RiUserLine,
    RiGoogleFill,
    RiGithubFill,
    RiDiscordFill,
    RiFlashlightLine,
} from 'react-icons/ri';

type AuthFormProps = {
    mode: 'sign-in' | 'sign-up';
};

const PASSWORD_POLICY_MESSAGE =
    'Password should contain at least one character of each: abcdefghijklmnopqrstuvwxyz, ABCDEFGHIJKLMNOPQRSTUVWXYZ, 0123456789.';

const OAUTH_ICONS: Record<'google' | 'github' | 'discord', React.ReactNode> = {
    google: <RiGoogleFill className="size-4" />,
    github: <RiGithubFill className="size-4" />,
    discord: <RiDiscordFill className="size-4" />,
};

export default function AuthForm({ mode }: AuthFormProps) {
    const isSignIn = mode === 'sign-in';
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);

    const oauthProviders = useMemo(() => {
        const raw = process.env.NEXT_PUBLIC_SUPABASE_AUTH_PROVIDERS ?? 'google,github';
        return raw
            .split(',')
            .map((s) => s.trim().toLowerCase())
            .filter((s): s is 'google' | 'github' | 'discord' =>
                s === 'google' || s === 'github' || s === 'discord'
            );
    }, []);

    const { normalizedUsername, status: usernameStatus, isAvailable: isUsernameAvailable, isChecking: isUsernameChecking } =
        useUsernameAvailability({
            value: username,
            enabled: !isSignIn,
        });
    const passwordPolicyMessage = useMemo(() => {
        if (isSignIn || !password) {
            return '';
        }

        const hasLowercase = /[a-z]/.test(password);
        const hasUppercase = /[A-Z]/.test(password);
        const hasDigit = /[0-9]/.test(password);

        return hasLowercase && hasUppercase && hasDigit ? '' : PASSWORD_POLICY_MESSAGE;
    }, [isSignIn, password]);

    async function handleEmailAuth(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);

        try {
            if (isSignIn) {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                toast.success('Signed in successfully');
                router.push('/profile');
                return;
            }

            if (normalizedUsername.length < 3) {
                toast.error('Username must be at least 3 characters');
                return;
            }

            if (!isUsernameAvailable) {
                toast.error('Choose an available username before creating your account');
                return;
            }

            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { username: normalizedUsername },
                    emailRedirectTo: `${window.location.origin}/profile`,
                },
            });

            if (error) throw error;

            if (data.session) {
                toast.success('Account created');
                router.push('/profile');
            } else {
                toast.success('Check your email to confirm your account');
            }
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Authentication failed');
        } finally {
            setLoading(false);
        }
    }

    async function handleOAuth(provider: 'google' | 'github' | 'discord') {
        setLoading(true);
        const { error } = await supabase.auth.signInWithOAuth({
            provider,
            options: { redirectTo: `${window.location.origin}/profile` },
        });
        if (error) {
            toast.error(error.message);
            setLoading(false);
        }
    }

    return (
        <div className="w-full rounded-4xl border border-border bg-card p-7 shadow-xl dark:shadow-black/40 sm:p-8">
            {/* Brand */}
            <div className="mb-6 flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <RiFlashlightLine className="size-4" />
                </div>
                <span className="text-[15px] font-semibold tracking-tight text-foreground">SnapHost</span>
            </div>

            {/* Heading */}
            <div className="mb-6">
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                    {isSignIn ? 'Welcome back' : 'Create your account'}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    {isSignIn
                        ? 'Sign in to continue to your dashboard.'
                        : 'Get started — it only takes a minute.'}
                </p>
            </div>

            {/* Form */}
            <form className="space-y-4" onSubmit={handleEmailAuth}>
                {!isSignIn && (
                    <Field>
                        <FieldLabel htmlFor="username">Username</FieldLabel>
                        <div className="relative">
                            <RiUserLine className="pointer-events-none absolute left-3 top-3.5 size-4 text-muted-foreground" />
                            <UsernameAvailability
                                id="username"
                                value={username}
                                isChecking={isUsernameChecking}
                                statusText={usernameStatus.text}
                                statusTone={usernameStatus.tone}
                                onChange={setUsername}
                                disabled={loading}
                                className="pl-9"
                            />
                        </div>
                    </Field>
                )}

                <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <div className="relative">
                        <RiMailLine className="pointer-events-none absolute left-3 top-3.5 size-4 text-muted-foreground" />
                        <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                            required
                            disabled={loading}
                            className="h-10 pl-9"
                        />
                    </div>
                </Field>

                <Field>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <div className="relative">
                        <RiLockPasswordLine className="pointer-events-none absolute left-3 top-3.5 size-4 text-muted-foreground" />
                        <Input
                            id="password"
                            type="password"
                            placeholder={isSignIn ? 'Your password' : 'Min. 8 characters'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete={isSignIn ? 'current-password' : 'new-password'}
                            required
                            minLength={8}
                            disabled={loading}
                            className="h-10 pl-9"
                            aria-invalid={!isSignIn && Boolean(passwordPolicyMessage)}
                        />
                    </div>
                    {!isSignIn && passwordPolicyMessage && (
                        <p className="text-xs text-rose-600 dark:text-rose-400">{passwordPolicyMessage}</p>
                    )}
                </Field>

                {isSignIn && (
                    <div className="flex justify-end">
                        <Link
                            href="/forgot-password"
                            className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                        >
                            Forgot password?
                        </Link>
                    </div>
                )}

                <Button
                    type="submit"
                    className="h-10 w-full rounded-xl font-semibold"
                    disabled={loading || (!isSignIn && (!isUsernameAvailable || isUsernameChecking))}
                >
                    {loading ? 'Please wait…' : isSignIn ? 'Sign in' : 'Create account'}
                </Button>
            </form>

            {/* OAuth */}
            {oauthProviders.length > 0 && (
                <>
                    <div className="my-5 flex items-center gap-3">
                        <Separator className="flex-1" />
                        <span className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">or</span>
                        <Separator className="flex-1" />
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                        {oauthProviders.map((provider) => (
                            <Button
                                key={provider}
                                type="button"
                                variant="outline"
                                className="h-10 gap-2 rounded-xl text-sm font-medium"
                                onClick={() => handleOAuth(provider)}
                                disabled={loading}
                            >
                                {OAUTH_ICONS[provider]}
                                {provider[0].toUpperCase() + provider.slice(1)}
                            </Button>
                        ))}
                    </div>
                </>
            )}

            {/* Footer */}
            <p className="mt-6 text-center text-xs text-muted-foreground">
                {isSignIn ? (
                    <>
                        Don&apos;t have an account?{' '}
                        <Link href="/sign-up" className="font-medium text-foreground underline-offset-4 hover:underline">
                            Sign up
                        </Link>
                    </>
                ) : (
                    <>
                        Already have an account?{' '}
                        <Link href="/sign-in" className="font-medium text-foreground underline-offset-4 hover:underline">
                            Sign in
                        </Link>
                    </>
                )}
            </p>
        </div>
    );
}