import { createContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserModel } from '../models/userModel';
import { fetchServer } from '../server';
import { LOGIN_ROUTE, PING_ROUTE } from '../server/configs';

export const AuthContext = createContext<any>({});

export function AuthProvider({ children }: any) {
    const navigate = useNavigate();
    const [user, setUser] = useState<UserModel | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const recoveredUser = localStorage.getItem('user');

        if (recoveredUser) {
            setUser(JSON.parse(recoveredUser));

            fetchServer({
                route: PING_ROUTE,
                method: "GET",
                user: JSON.parse(recoveredUser),
            }).then(response => {
                setUser(JSON.parse(recoveredUser));
            }).catch(() => {
                logout();
            }).finally(() => {
                setLoading(false);
            })
        } else {
            logout();
            setLoading(false);
        }
    }, []);

    function login(user: UserModel) {
        fetch(LOGIN_ROUTE, {
            method: "POST",
            body: JSON.stringify(user),
            headers: { 'Content-Type': 'application/json' },
        }).then(response => {
            return response.json();
        }).then(response => {
            if (response.message) {
                console.log("Erro");
            } else {
                localStorage.setItem('user', JSON.stringify(response));
                setUser(response);
                navigate("/");
            }
        });
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