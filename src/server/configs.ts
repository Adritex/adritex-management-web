const API_HOST = "http://localhost:3000/api";
const CUSTOMER_ROUTE = `${API_HOST}/customers`;
const EMPLOYEE_ROUTE = `${API_HOST}/employees`;
const EXPENSE_ROUTE = `${API_HOST}/financial/expenses`;
const PAYROLLS_ROUTE = `${API_HOST}/financial/payrolls`;
const PRODUCT_ROUTE = `${API_HOST}/demand/products`;
const PRODUCT_ORDERS_ROUTE = `${API_HOST}/demand/products/in-orders`;
const ORDERS_ROUTE = `${API_HOST}/demand/orders`;
const GOAL_ROUTE = `${API_HOST}/demand/goals`;
const LOGIN_ROUTE = `${API_HOST}/login`;
const PING_ROUTE = `${API_HOST}/ping`;
const DASHBOARD_ROUTE = `${API_HOST}/dashboard`;

export {
    API_HOST,
    CUSTOMER_ROUTE,
    EMPLOYEE_ROUTE,
    EXPENSE_ROUTE,
    PAYROLLS_ROUTE,
    PRODUCT_ROUTE,
    PRODUCT_ORDERS_ROUTE,
    ORDERS_ROUTE,
    LOGIN_ROUTE,
    PING_ROUTE,
    DASHBOARD_ROUTE,
    GOAL_ROUTE
}