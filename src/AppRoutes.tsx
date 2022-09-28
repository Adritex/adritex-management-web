import {
    BrowserRouter as Router,
    Route,
    Routes
} from 'react-router-dom';
import { AuthProvider } from './contexts/authContext';

import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import { Private } from './components/Private';

export function AppRoutes() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    <Route path='/login' element={<LoginPage />} />
                    <Route path='/' element={
                        <Private><HomePage /></Private>
                    } />
                </Routes>
            </AuthProvider>
        </Router>
    );
}