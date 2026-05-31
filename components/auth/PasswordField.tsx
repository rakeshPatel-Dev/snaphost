"use client";

import { useId, useState } from 'react';
import { Eye, EyeOff, LockKeyhole } from 'lucide-react';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group';
import { cn } from '@/lib/utils';

type PasswordFieldProps = React.ComponentProps<typeof InputGroupInput> & {
    wrapperClassName?: string;
};

export default function PasswordField({
    wrapperClassName,
    className,
    id,
    type,
    ...props
}: PasswordFieldProps) {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const [isVisible, setIsVisible] = useState(false);

    const inputType = isVisible ? 'text' : 'password';

    return (
        <InputGroup className={cn('h-10 rounded-xl bg-background', wrapperClassName)}>
            <InputGroupAddon align="inline-start" className="px-2.5 text-muted-foreground">
                <LockKeyhole className="h-4 w-4" />
            </InputGroupAddon>
            <InputGroupInput
                id={inputId}
                type={type === 'password' ? inputType : type}
                className={cn('h-10 px-0', className)}
                {...props}
            />
            <InputGroupAddon align="inline-end" className="px-1.5">
                <InputGroupButton
                    size="icon-xs"
                    variant="ghost"
                    type="button"
                    onClick={() => setIsVisible((current) => !current)}
                    aria-label={isVisible ? 'Hide password' : 'Show password'}
                    aria-pressed={isVisible}
                    className="text-muted-foreground hover:text-foreground"
                >
                    {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </InputGroupButton>
            </InputGroupAddon>
        </InputGroup>
    );
}