'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

type AuthContextValue = {
    user: User | null;
    isLoading: boolean;
    isSignedIn: boolean;
    signOut: () => Promise<void>;
    refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const loadUser = async () => {
            try {
                const { data } = await supabase.auth.getUser();

                if (mounted) {
                    setUser(data.user ?? null);
                    setIsLoading(false);
                }
            } catch {
                if (mounted) {
                    setUser(null);
                    setIsLoading(false);
                }
            }
        };

        loadUser();

        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!mounted) {
                return;
            }

            setUser(session?.user ?? null);
            setIsLoading(false);
        });

        return () => {
            mounted = false;
            listener.subscription.unsubscribe();
        };
    }, []);

    const refreshUser = useCallback(async () => {
        const { data } = await supabase.auth.getUser();
        setUser(data.user ?? null);
        setIsLoading(false);
    }, []);

    const value = useMemo<AuthContextValue>(
        () => ({
            user,
            isLoading,
            isSignedIn: Boolean(user),
            signOut: async () => {
                await supabase.auth.signOut();
            },
            refreshUser,
        }),
        [user, isLoading, refreshUser]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);

    if (!ctx) {
        throw new Error('useAuth must be used within AuthProvider');
    }

    return ctx;
}
