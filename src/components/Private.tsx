import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/authContext';

export function Private({ children }: any) {
    const { authenticated, loading, user } = useContext(AuthContext);

    if (loading) {
        return <div className='loading'>Carregando...</div>
    }

    if (!authenticated) {
        return <Navigate to="/login" />
    }

    // if(user.accessType != 0) {
    //     return <Navigate to="/" />
    // }

    return children;
}