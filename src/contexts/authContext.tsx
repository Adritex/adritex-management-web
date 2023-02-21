import { createContext, useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserModel } from '../models/userModel';
import { UserSessionModel } from '../models/userSessionModel';
import { fetchServer } from '../server';
import { LOGIN_ROUTE, PING_ROUTE } from '../server/configs';

type AuthContextProps = {
    authenticated: boolean
    userSession: UserSessionModel | null
    loading: boolean
    login(userModel: UserModel): Promise<void>
    logout(): void
}

const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

export function AuthProvider({ children }: any) {
    const navigate = useNavigate();
    const [userSession, setUserSession] = useState<UserSessionModel | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        async function getUserSessionFromLocal() {
            const recoveredUserSession = localStorage.getItem('userSession');

            if(recoveredUserSession) {
                const userSession = JSON.parse(recoveredUserSession);
                const response = await fetchServer({
                    route: PING_ROUTE,
                    method: "GET",
                    user: userSession,
                });
                
                if(response) {
                   setUserSession(userSession); 
                } else {
                    logout();
                }
            } else {
                logout();
            }

            setLoading(false);
        }

        getUserSessionFromLocal();
    }, []);

    async function login(user: UserModel) {
        const response = await fetch(LOGIN_ROUTE, {
            method: "POST",
            body: JSON.stringify(user),
            headers: { 'Content-Type': 'application/json' },
        });

        const result = await response.json();

        if(result.error) {
            throw new Error(result.message);
        }

        const userSession = {
            id: result.user.id,
            token: result.token,
            username: result.user.username,
            accessType: result.user.accessType,
        } as UserSessionModel;

        localStorage.setItem('userSession', JSON.stringify(userSession));
        setUserSession(userSession);
        navigate('/');
    }

    function logout() {
        localStorage.removeItem('userSession');
        setUserSession(null);
        navigate('/login');
    }

    return (
        <AuthContext.Provider value={{ authenticated: !!userSession, userSession, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext);