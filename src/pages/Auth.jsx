import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function Auth({ onLogin }) {
    const handleGoogleLogin = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
            });
            if (error) throw error;
        } catch (error) {
            console.error('Error logging in:', error.message);
            alert(error.message);
        }
    };

    useEffect(() => {
        // Check active sessions and sets the user
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                onLogin({
                    id: session.user.id,
                    name: session.user.user_metadata.full_name || session.user.email.split('@')[0],
                    email: session.user.email,
                    role: session.user.user_metadata.role || 'user' // check if admin
                });
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                onLogin({
                    id: session.user.id,
                    name: session.user.user_metadata.full_name || session.user.email.split('@')[0],
                    email: session.user.email,
                    role: session.user.user_metadata.role || 'user'
                });
            } else {
                onLogin(null);
            }
        });

        return () => subscription.unsubscribe();
    }, [onLogin]);

    return (
        <div className="auth-container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
            <div className="glass-card auth-card" style={{ padding: '40px', textAlign: 'center', maxWidth: '400px', width: '100%' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>
                    Welcome to AI Resume Maker
                </h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
                    Sign in to create, manage, and professionally refine your resumes.
                </p>

                <button 
                    onClick={handleGoogleLogin}
                    className="btn-secondary" 
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px' }}
                >
                    <svg style={{ width: '20px', height: '20px' }} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Continue with Google
                </button>
            </div>
        </div>
    );
}
