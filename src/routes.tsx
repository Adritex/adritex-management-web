import * as routerDom from "react-router-dom";
import { HomePage } from "./pages/Home";
import { ExpensesPage } from "./pages/Expenses";
import { ProductsPage } from "./pages/Products";
import { EmployeesPage } from "./pages/Employees";
import { PaymentsPage } from "./pages/Payments";
import { UsersPage } from "./pages/Users";
import { CustomersPage } from "./pages/Customers";
import { OrdersPage } from "./pages/Orders";
import { DashboardPage } from "./pages/Dashboard";

export function Routes() {
    return (
        <routerDom.BrowserRouter>
            <routerDom.Routes>
                <routerDom.Route path="/" element={<HomePage />} />
                <routerDom.Route path="/funcionarios" element={<EmployeesPage />} />
                <routerDom.Route path="/clientes" element={<CustomersPage />} />
                <routerDom.Route path="/usuarios" element={<UsersPage />} />
                <routerDom.Route path="/financeiro/despesas" element={<ExpensesPage />} />
                <routerDom.Route path="/financeiro/pagamentos" element={<PaymentsPage />} />
                <routerDom.Route path="/pedidos/produtos" element={<ProductsPage />} />
                <routerDom.Route path="/pedidos/ordens" element={<OrdersPage />} />
                <routerDom.Route path="/dashboard" element={<DashboardPage />} />
            </routerDom.Routes>
        </routerDom.BrowserRouter>
    );
}