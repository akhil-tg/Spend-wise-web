'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { User as AppUser } from '@/types';

interface AuthContextType {
    user: User | null;
    userData: AppUser | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
    updateUserData: (data: Partial<AppUser>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<AppUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!supabase) {
            setLoading(false);
            return;
        }

        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchUserData(session.user.id);
            } else {
                setLoading(false);
            }
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchUserData(session.user.id);
            } else {
                setUserData(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchUserData = async (userId: string) => {
        if (!supabase) return;

        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('uid', userId)
            .single();

        if (data) {
            setUserData({
                uid: data.uid,
                email: data.email || '',
                displayName: data.display_name || '',
                fullName: data.full_name || '',
                age: data.age || 0,
                dateOfBirth: data.date_of_birth || '',
                avatar: data.avatar || '',
                createdAt: new Date(data.created_at)
            });
        } else if (error) {
            // User doesn't exist, new user
            setUserData(null);
        }
        setLoading(false);
    };

    const signInWithGoogle = async () => {
        if (!supabase) throw new Error('Supabase not configured');

        // Use production URL for deployed app, localhost for development
        const redirectUrl = process.env.NEXT_PUBLIC_APP_URL
            ? `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
            : `${window.location.origin}/dashboard`;

        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: redirectUrl
                }
            });

            if (error) throw error;
        } catch (error) {
            console.error('Error signing in with Google:', error);
            throw error;
        }
    };

    const signOut = async () => {
        if (!supabase) return;

        try {
            await supabase.auth.signOut();
            setUserData(null);
        } catch (error) {
            console.error('Error signing out:', error);
            throw error;
        }
    };

    const updateUserData = async (data: Partial<AppUser>) => {
        if (!supabase || !user) return;

        const { error } = await supabase
            .from('users')
            .upsert({
                uid: user.id,
                email: user.email,
                display_name: user.user_metadata?.full_name || user.email?.split('@')[0],
                full_name: data.fullName,
                age: data.age,
                date_of_birth: data.dateOfBirth,
                avatar: data.avatar,
                updated_at: new Date().toISOString()
            });

        if (error) {
            console.error('Error updating user data:', error);
            throw error;
        }

        // Update local state
        setUserData(prev => prev ? { ...prev, ...data } : null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            userData,
            loading,
            signInWithGoogle,
            signOut,
            updateUserData
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
