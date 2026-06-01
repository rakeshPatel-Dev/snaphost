"use client";

import { useState } from 'react';
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
import { toast } from 'sonner';

export default function UserMenu() {
    const { user, signOut } = useAuth();
    const [accountDeleteOpen, setAccountDeleteOpen] = useState(false);

    async function handleSignOut() {
        try {
            await signOut();
            window.location.href = '/';
        } catch (e) {
            console.error('Error signing out:', e);
            toast.error('Failed to sign out. Please try again.');
        }
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="lg" className="h-8 w-8 p-0">
                        <Avatar size="lg">
                            {(() => {
                                const meta: any = (user as any)?.user_metadata ?? {};
                                const identities: any[] = (user as any)?.identities ?? [];
                                const avatarUrl = meta?.avatar_url ?? identities?.[0]?.identity_data?.avatar_url ?? null;
                                if (avatarUrl) {
                                    return <AvatarImage src={String(avatarUrl)} alt={String(meta?.full_name ?? user?.email ?? 'Profile')} />;
                                }
                                const usernameHint = (meta?.username as string) ?? (user?.email as string) ?? '';
                                const initial = usernameHint ? usernameHint.charAt(0).toUpperCase() : '';
                                return <AvatarFallback>{initial}</AvatarFallback>;
                                return <span>{meta?.username as string}</span>
                            })()}
                        </Avatar>
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
