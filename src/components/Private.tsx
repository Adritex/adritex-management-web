import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/authContext';

export function Private({ children }: any) {
    const { authenticated, loading } = useAuth();

    if (loading) return <div className='loading'>Carregando...</div>
    if (!authenticated) return <Navigate to="/login" />

    return children;
}