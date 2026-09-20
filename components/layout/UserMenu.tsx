"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import DeleteAccountDialog from '@/components/shared/DeleteAccountDialog';
import { useAuth } from '@/components/providers/auth-provider';
import { useTier } from '@/lib/useTier';
import { toast } from 'sonner';
import { AUTH_ERRORS } from '@/lib/messages';

export default function UserMenu() {
    const { user, signOut } = useAuth();
    const { isPremium } = useTier();
    const [accountDeleteOpen, setAccountDeleteOpen] = useState(false);
    const router = useRouter();

    const meta = (user?.user_metadata ?? {}) as Record<string, unknown>;
    const identityData = ((user?.identities ?? []) as Array<{
        identity_data?: Record<string, unknown>;
    }>).map((identity) => identity.identity_data ?? {});

    const avatarUrl =
        (meta.avatar_url as string | undefined) ??
        (meta.picture as string | undefined) ??
        (identityData.flatMap((data) => [data.avatar_url, data.picture]).find(
            (value): value is string => typeof value === 'string' && value.length > 0
        ) ??
        null);

    const displayName = String(meta.full_name ?? meta.name ?? meta.username ?? user?.email ?? 'Profile');
    const initial = displayName.trim().charAt(0).toUpperCase();

    async function handleSignOut() {
        try {
            await signOut();
            router.push('/');
        } catch (e) {
            console.error('Error signing out:', e);
            toast.error(AUTH_ERRORS.failedToSignOut);
        }
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 relative cursor-pointer rounded-full">
                        <Avatar size="sm">
                            {avatarUrl ? <AvatarImage src={avatarUrl} alt={displayName} /> : null}
                            <AvatarFallback>{initial}</AvatarFallback>
                        </Avatar>
                        {isPremium && (
                            <span className="premium-gradient absolute -bottom-0.5 -right-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full px-[3px] text-[8px] font-bold leading-none text-white ring-2 ring-background">
                                P
                            </span>
                        )}
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent sideOffset={8} align="end">
                    <DropdownMenuItem asChild>
                        <Link href="/profile">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={handleSignOut}>Sign out</DropdownMenuItem>
                    <DropdownMenuItem data-variant="destructive" onSelect={() => setAccountDeleteOpen(true)}>
                        Delete account
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <DeleteAccountDialog trigger={null} open={accountDeleteOpen} onOpenChange={setAccountDeleteOpen} />
        </>
    );
}
