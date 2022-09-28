import { createContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserModel } from '../models/userModel';

export const AuthContext = createContext<any>({});

export function AuthProvider({ children }: any) {
    const navigate = useNavigate();
    const [user, setUser] = useState<UserModel | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const recoveredUser = localStorage.getItem('user');

        if (recoveredUser) {
            setUser(JSON.parse(recoveredUser));
        }

        setLoading(false);
    }, []);

    function login(user: UserModel) {
        if (user.password === 'secret') {
            setUser(user);
            user.password = '';

            localStorage.setItem('user', JSON.stringify(user));

            navigate('/');
        }
    }

    function logout() {
        localStorage.removeItem('user');
        setUser(null);
        navigate('/login');
    }

    return (
        <AuthContext.Provider value={{ authenticated: !!user, user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}