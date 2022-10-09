import {
    BrowserRouter as Router,
    Route,
    Routes
} from 'react-router-dom';
import { AuthProvider } from './contexts/authContext';

import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import CustomerPage from './pages/CustomerPage';
import EmployeePage from './pages/EmployeePage';
import ExpensePage from './pages/ExpensePage';
import PaymentPage from './pages/PaymentPage';
import ProductPage from './pages/ProductPage';
import OrderPage from './pages/OrderPage';

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
                    <Route path='/clientes' element={
                        <Private><CustomerPage /></Private>
                    } />
                    <Route path='/funcionarios' element={
                        <Private><EmployeePage /></Private>
                    } />
                    <Route path='/financeiro/despesas' element={
                        <Private><ExpensePage /></Private>
                    } />
                    <Route path='/financeiro/pagamentos' element={
                        <Private><PaymentPage /></Private>
                    } />
                    <Route path='/pedidos/produtos' element={
                        <Private><ProductPage /></Private>
                    } />
                    <Route path='/pedidos/ordens' element={
                        <Private><OrderPage /></Private>
                    } />
                </Routes>
            </AuthProvider>
        </Router>
    );
}