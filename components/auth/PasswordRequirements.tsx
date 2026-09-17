"use client";

import { cn } from '@/lib/utils';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

type PasswordRequirementsMode = 'sign-in' | 'sign-up' | 'reset-password';

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
    className,
}: PasswordRequirementsProps) {
    const { requirements } =
        evaluatePasswordRequirements(password, confirmPassword);

    return (
        <TooltipProvider delayDuration={0}>
            <div
                id={id}
                className={cn('w-full', className)}
            >
                <div className="flex h-1.5 gap-1.5">
                    {requirements.map((req) => {
                        const isMet = req.met;

                        return (
                            <Tooltip key={req.key}>
                                <TooltipTrigger asChild>
                                    <div
                                        className={cn(
                                            'h-full flex-1 rounded-full transition-all duration-300 ease-out',
                                            isMet ? 'bg-emerald-500' : 'bg-muted border border-border/50',
                                        )}
                                    />
                                </TooltipTrigger>
                                <TooltipContent side="bottom" className="px-2 py-1 text-xs font-medium">
                                    <p className={cn(isMet ? "text-emerald-500" : "text-background")}>
                                        {req.label} {isMet ? '✓' : ''}
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        );
                    })}
                </div>
            </div>
        </TooltipProvider>
    );
}