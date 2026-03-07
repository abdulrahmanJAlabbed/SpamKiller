/**
 * Auth Context — Placeholder for Firebase Auth integration
 * Wraps the app root to provide authentication state globally.
 */

import React, { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

interface User {
    uid: string;
    email: string | null;
    displayName: string | null;
}

interface AuthContextValue {
    isAuthenticated: boolean;
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
    isAuthenticated: false,
    user: null,
    isLoading: false,
    login: async () => { },
    logout: async () => { },
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const login = useCallback(async (_email: string, _password: string) => {
        setIsLoading(true);
        try {
            // TODO: Replace with Firebase Auth
            // import auth from '@react-native-firebase/auth';
            // const credential = await auth().signInWithEmailAndPassword(email, password);
            // setUser({ uid: credential.user.uid, email: credential.user.email, displayName: credential.user.displayName });
            setUser({ uid: 'placeholder', email: _email, displayName: null });
        } finally {
            setIsLoading(false);
        }
    }, []);

    const logout = useCallback(async () => {
        setIsLoading(true);
        try {
            // TODO: Replace with Firebase Auth
            // await auth().signOut();
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated: !!user,
                user,
                isLoading,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
