"use client";

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Mail, User } from 'lucide-react';
import { RiGoogleFill, RiGithubFill, RiDiscordFill } from 'react-icons/ri';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import UsernameAvailability from '@/components/auth/UsernameAvailability';
import PasswordRequirements, { evaluatePasswordRequirements } from '@/components/auth/PasswordRequirements';
import PasswordField from '@/components/auth/PasswordField';
import { useUsernameAvailability } from '@/lib/useUsernameAvailability';
import { AUTH_ERRORS } from '@/lib/messages';
import { Field, FieldLabel } from '../ui/field';

type AuthFormProps = {
    mode: 'sign-in' | 'sign-up';
};

const FIELD_INPUT_CLASS = 'h-11 rounded-full border-border/60 bg-muted/20';

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

    const oauthProviders = (process.env.NEXT_PUBLIC_SUPABASE_AUTH_PROVIDERS ?? 'google,github')
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter((s): s is 'google' | 'github' | 'discord' =>
            s === 'google' || s === 'github' || s === 'discord'
        );

    const { normalizedUsername, status: usernameStatus, isAvailable: isUsernameAvailable, isChecking: isUsernameChecking } =
        useUsernameAvailability({
            value: username,
            enabled: !isSignIn,
        });
    const passwordRequirements = evaluatePasswordRequirements(password);
    const passwordIsStrong = passwordRequirements.isStrong;

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

            if (!passwordIsStrong) {
                return;
            }

            if (normalizedUsername.length < 3) {
                toast.error(AUTH_ERRORS.usernameTooShort);
                return;
            }

            if (!isUsernameAvailable) {
                toast.error(AUTH_ERRORS.usernameNotAvailable);
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
                // Redirect to check-email page with context
                router.replace(`/check-email?type=signup&email=${encodeURIComponent(email)}`);
                toast.info('Check your email for confirmation');
            }
        } catch (err) {
            toast.error(err instanceof Error ? err.message : AUTH_ERRORS.authFailed);
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
            toast.error(error.message || AUTH_ERRORS.oauthFailed);
            setLoading(false);
        }
    }

    return (
        <div className="w-full rounded-4xl border border-border/60 bg-card/80 p-7 backdrop-blur-xl shadow-[0_30px_80px_-40px_rgba(0,0,0,0.18)] sm:p-8">
            {/* Heading */}
            <div className="mb-6">
                <h1 className="text-3xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-4xl">
                    {isSignIn ? 'Welcome back' : 'Create your account'}
                </h1>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {isSignIn
                        ? 'Sign in to manage your uploads and links.'
                        : 'Set up a username and start sharing files.'}
                </p>
            </div>

            {/* Form */}
            <form className="space-y-4" onSubmit={handleEmailAuth}>
                {!isSignIn && (
                    <Field>
                        <FieldLabel htmlFor="username">Username</FieldLabel>
                        <div className="relative">
                            <User className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            <UsernameAvailability
                                id="username"
                                value={username}
                                isChecking={isUsernameChecking}
                                statusText={usernameStatus.text}
                                statusTone={usernameStatus.tone}
                                onChange={setUsername}
                                disabled={loading}
                                className={`${FIELD_INPUT_CLASS} pl-9`}
                            />
                        </div>
                    </Field>
                )}

                <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <div className="relative">
                        <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                            required
                            disabled={loading}
                            className={`${FIELD_INPUT_CLASS} pl-9`}
                        />
                    </div>
                </Field>

                <Field>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <PasswordField
                        id="password"
                        placeholder={isSignIn ? 'Your password' : 'Min. 8 characters'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete={isSignIn ? 'current-password' : 'new-password'}
                        required
                        minLength={8}
                        disabled={loading}
                        aria-invalid={!isSignIn && !passwordIsStrong}
                        className={FIELD_INPUT_CLASS}
                    />
                    <PasswordRequirements
                        id="password-requirements"
                        mode={isSignIn ? 'sign-in' : 'sign-up'}
                        password={password}
                        className="mt-3"
                    />
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
                    size="lg"
                    className="h-11 w-full cursor-pointer"
                    disabled={loading || (!isSignIn && (!isUsernameAvailable || isUsernameChecking || !passwordIsStrong))}
                >
                    {loading ? 'Please wait…' : isSignIn ? 'Sign in' : 'Create account'}
                </Button>
            </form>

            {/* OAuth */}
            {oauthProviders.length > 0 && (
                <>
                    <div className="relative my-5">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border/60" />
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-card px-3 text-xs text-muted-foreground">or continue with</span>
                        </div>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                        {oauthProviders.map((provider) => (
                            <Button
                                key={provider}
                                type="button"
                                variant="outline"
                                className="h-11 w-full cursor-pointer gap-2 rounded-full text-sm font-medium"
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
                        <Link href="/sign-up" className="font-medium text-accent underline-offset-4 hover:underline">
                            Sign up
                        </Link>
                    </>
                ) : (
                    <>
                        Already have an account?{' '}
                        <Link href="/sign-in" className="font-medium text-accent underline-offset-4 hover:underline">
                            Sign in
                        </Link>
                    </>
                )}
            </p>
        </div>
    );
}