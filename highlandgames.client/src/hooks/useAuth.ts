import { useState } from 'react';
import { authApi } from '../api/authApi';

export function useAuth() {
    const [loggedIn, setLoggedIn] = useState<boolean>(() => !!localStorage.getItem('hg_token'));
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const login = async (password: string) => {
        setLoading(true);
        setError('');
        try {
            const { token } = await authApi.login(password);
            localStorage.setItem('hg_token', token);
            setLoggedIn(true);
        } catch {
            setError('Falsches Passwort');
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('hg_token');
        setLoggedIn(false);
    };

    return { loggedIn, error, loading, login, logout };
}