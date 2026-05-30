'use client';

import { LoaderCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export type UsernameAvailabilityState = {
    id: string;
    value: string;
    isChecking: boolean;
    statusText: string;
    statusTone: 'neutral' | 'good' | 'warn' | 'bad';
    onChange: (value: string) => void;
};

type UsernameAvailabilityProps = UsernameAvailabilityState & {
    disabled?: boolean;
    className?: string;
};

export default function UsernameAvailability({
    id,
    value,
    isChecking,
    statusText,
    statusTone,
    onChange,
    disabled,
    className,
}: UsernameAvailabilityProps) {
    return (
        <div className="space-y-2">
            <Input
                id={id}
                type="text"
                placeholder="Username"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                autoComplete="username"
                required
                minLength={3}
                maxLength={32}
                disabled={disabled}
                className={cn('h-10', className)}
            />
            <p
                className={cn(
                    'flex min-h-5 items-center gap-1.5 text-xs',
                    statusTone === 'good' && 'text-emerald-600 dark:text-emerald-400',
                    statusTone === 'warn' && 'text-amber-600 dark:text-amber-400',
                    statusTone === 'bad' && 'text-rose-600 dark:text-rose-400',
                    statusTone === 'neutral' && 'text-muted-foreground'
                )}
            >
                {isChecking ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : null}
                <span>{isChecking ? 'Checking username...' : statusText || 'Choose a username for your public profile.'}</span>
            </p>
        </div>
    );
}
