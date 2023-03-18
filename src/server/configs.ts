// const API_HOST = "http://191.252.179.165:8050/api";
const API_HOST = "http://localhost:8050/api";
const CUSTOMER_ROUTE = `${API_HOST}/customers`;
const EMPLOYEE_ROUTE = `${API_HOST}/employees`;
const EXPENSE_ROUTE = `${API_HOST}/expenses`;
const PAYROLLS_ROUTE = `${API_HOST}/payrolls`;
const PRODUCT_ROUTE = `${API_HOST}/products`;
const PRODUCT_ORDERS_ROUTE = `${API_HOST}/products/status`;
const ORDERS_ROUTE = `${API_HOST}/product-orders`;
const GOAL_ROUTE = `${API_HOST}/goals`;
const LOGIN_ROUTE = `${API_HOST}/auth/login`;
const PING_ROUTE = `${API_HOST}/auth/ping`;
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