"use client";

import { LockKeyhole, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export type PasswordRequirementsMode = 'sign-in' | 'sign-up' | 'reset-password';

export function evaluatePasswordRequirements(password: string, confirmPassword = '') {
    const hasLength = password.length >= 8;
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasDigit = /[0-9]/.test(password);
    const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;

    const requirements = [
        { key: 'length', label: '8+ characters', met: hasLength },
        { key: 'lowercase', label: 'Lowercase (a-z)', met: hasLowercase },
        { key: 'uppercase', label: 'Uppercase (A-Z)', met: hasUppercase },
        { key: 'digit', label: 'Number (0-9)', met: hasDigit },
    ];

    if (confirmPassword.length > 0) {
        requirements.push({ key: 'match', label: 'Passwords match', met: passwordsMatch });
    }

    const metCount = requirements.filter(r => r.met).length;
    const total = requirements.length;
    const percentage = (metCount / total) * 100;

    return {
        requirements,
        metCount,
        total,
        percentage,
        isStrong: metCount === total,
    };
}

type PasswordRequirementsProps = {
    id?: string;
    password: string;
    confirmPassword?: string;
    mode: PasswordRequirementsMode;
    className?: string;
};

export default function PasswordRequirements({
    id,
    password,
    confirmPassword,
    mode,
    className,
}: PasswordRequirementsProps) {
    const { requirements, percentage } =
        evaluatePasswordRequirements(password, confirmPassword);

    const segmentWidth = 100 / requirements.length;

    return (
        <div
            id={id}
            className={cn('w-full', className)}
        >
            <div className="flex items-center gap-2 mb-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-background">
                    {mode === 'reset-password' ? (
                        <ShieldCheck className="h-4 w-4" />
                    ) : (
                        <LockKeyhole className="h-4 w-4" />
                    )}
                </div>
                <span className="text-sm font-semibold text-foreground">
                    Password strength
                </span>
            </div>

            <div className="flex h-2 rounded-full overflow-hidden">
                {requirements.map((req, index) => {
                    const isMet = req.met;
                    const filledPercentage = isMet ? 100 : 0;

                    return (
                        <div
                            key={req.key}
                            className="relative group flex-1 h-full first:rounded-l-full last:rounded-r-full"
                            style={{ width: `${segmentWidth}%` }}
                        >
                            <div className="absolute inset-0 bg-muted" />
                            <div
                                className={cn(
                                    'absolute inset-0 transition-all duration-300 ease-out',
                                    isMet ? 'bg-emerald-500' : 'bg-rose-500/50'
                                )}
                                style={{ width: `${filledPercentage}%` }}
                            />
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                {req.label}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900" />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}