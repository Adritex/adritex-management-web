import { useState, useEffect, useContext } from "react";

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ColumnGroup } from 'primereact/columngroup';
import { Row } from 'primereact/row';
import { Chart } from 'primereact/chart';
import { fetchServer } from "../../server";
import { CUSTOMER_ROUTE, DASHBOARD_ROUTE } from "../../server/configs";
import { useAuth } from "../../contexts/authContext";

interface ProductTable {
    customer: string;
    amount: number;
}

interface ExpenseTable {
    name: string;
    description: string;
    value: number;
}

interface AnnualBilling {
    name: string;
    value: number;
}

function DashboardPage() {
    const { userSession } = useAuth();
    const [expenses, setExpenses] = useState<ExpenseTable[]>([]);
    const [products, setProducts] = useState<ProductTable[]>([]);
    const [basicData, setBasicData] = useState<any>();
    const [annualBillingChart, setAnnualBillingChart] = useState<any>();
    const [annualBilling, setAnnualBilling] = useState<AnnualBilling[]>();

    useEffect(() => {
        var date = new Date();
        var startDate = new Date(date.getFullYear(), date.getMonth(), 1);
        var endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        fetchServer({
            route: DASHBOARD_ROUTE,
            method: "PUT",
            user: userSession,
            body: JSON.stringify({
                startDate: startDate,
                endDate: endDate,
            })
        }).then(response => {
            setExpenses(response.expenses);
            setProducts(response.products);

            let expensesValue = 0;
            let productsValue = 0;

            response.expenses.forEach((expense: any) => expensesValue += Number(expense.value));
            response.products.forEach((product: any) => productsValue += Number(product.amount));

            setBasicData({
                labels: ["Mês atual"],
                datasets: [
                    {
                        label: 'Despesas',
                        backgroundColor: '#bd0404',
                        data: [expensesValue]
                    },
                    {
                        label: 'Receitas',
                        backgroundColor: '#03a603',
                        data: [productsValue]
                    }
                ]
            });

            const annual: AnnualBilling[] = [
                { name: "Janeiro", value: response.annualBilling[0] },
                { name: "Fevereiro", value: response.annualBilling[1] },
                { name: "Março", value: response.annualBilling[2] },
                { name: "Abril", value: response.annualBilling[3] },
                { name: "Maio", value: response.annualBilling[4] },
                { name: "Junho", value: response.annualBilling[5] },
                { name: "Julho", value: response.annualBilling[6] },
                { name: "Agosto", value: response.annualBilling[7] },
                { name: "Setembro", value: response.annualBilling[8] },
                { name: "Outubro", value: response.annualBilling[9] },
                { name: "Novembro", value: response.annualBilling[10] },
                { name: "Dezembro", value: response.annualBilling[11] },
            ];
            setAnnualBilling(annual);

            setAnnualBillingChart({
                labels: [
                    'Janeiro', 'Fevereiro', 'Março',
                    'Abril', 'Maio', 'Junho',
                    'Julho', 'Agosto', 'Setembro',
                    'Outubro', 'Novembro', 'Dezembro'
                ],
                datasets: [
                    {
                        label: 'Receitas',
                        backgroundColor: '#03a603',
                        data: annual.map(item => item.value)
                    },
                ]
            });
        });
    }, []);

    let basicOptions = {
        maintainAspectRatio: false,
        aspectRatio: .8,
        plugins: {
            legend: {
                labels: {
                    color: '#495057'
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: '#495057'
                },
                grid: {
                    color: '#ebedef'
                }
            },
            y: {
                ticks: {
                    color: '#495057'
                },
                grid: {
                    color: '#ebedef'
                }
            }
        }
    };

    function totalProductValue() {
        let total = 0;

        products.forEach(item => {
            total += Number(item.amount);
        });

        return formatValue(total);
    }

    function totalExpenseValue() {
        let total = 0;

        expenses.forEach(item => {
            total += Number(item.value);
        });

        return formatValue(total);
    }

    function totalAnnualBilling() {
        let total = 0;

        annualBilling?.forEach(item => {
            total += item.value
        });

        return formatValue(total);
    }

    function formatProductValue(rowData: ProductTable) {
        return formatValue(rowData.amount);
    }

    function formatExpenseValue(rowData: ExpenseTable) {
        return formatValue(rowData.value);
    }

    function formatAnnualBillingValue(rowData: AnnualBilling) {
        return formatValue(rowData?.value || 0);
    }

    function formatValue(value: number) {
        if(value) {
            return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
        }

        return 0;
    }

    const headerGroupExpense = (
        <div className="flex justify-content-between align-items-center">
            <h5 className="m-0">Despesas</h5>
        </div>
    );

    const headerGroupProduct = (
        <div className="flex justify-content-between align-items-center">
            <h5 className="m-0">Pedidos</h5>
        </div>
    );

    const headerGroupAnnualBilling = (
        <div className="flex justify-content-between align-items-center">
            <h5 className="m-0">Faturamento anual</h5>
        </div>
    );

    const footerGroupExpense = (
        <ColumnGroup>
            <Row>
                <Column footer="Total:" colSpan={2} footerStyle={{ textAlign: 'right' }} />
                <Column footer={totalExpenseValue} />
            </Row>
        </ColumnGroup>
    );

    const footerGroupProduct = (
        <ColumnGroup>
            <Row>
                <Column footer="Total:" footerStyle={{ textAlign: 'right' }} />
                <Column footer={totalProductValue} />
            </Row>
        </ColumnGroup>
    );

    const footerGroupAnnualBilling = (
        <ColumnGroup>
            <Row>
                <Column footer="Total:" footerStyle={{ textAlign: 'right' }} />
                <Column footer={totalAnnualBilling} />
            </Row>
        </ColumnGroup>
    );

    return (
        <div className="h-screen w-full mt-3">
            <div className="grid">
                <div className="col">
                    <DataTable
                        value={expenses}
                        stripedRows scrollable header={headerGroupExpense}
                        scrollHeight="330px" className="p-datatable"
                        emptyMessage="Nenhum registro encontrado." footerColumnGroup={footerGroupExpense}>
                        <Column field="name" header="Nome" />
                        <Column field="description" header="Descrição" />
                        <Column field="value" header="Valor" body={formatExpenseValue} />
                    </DataTable>
                </div>
                <div className="col">
                    <DataTable
                        value={products}
                        stripedRows scrollable header={headerGroupProduct}
                        scrollHeight="330px" className="p-datatable border-round"
                        emptyMessage="Nenhum registro encontrado." footerColumnGroup={footerGroupProduct}>
                        <Column field="customer" header="Cliente" />
                        <Column field="amount" header="Valor" body={formatProductValue} />
                    </DataTable>
                </div>
                <div className="col">
                    <div className="card bg-white px-3 py-1">
                        <Chart type="bar" data={basicData} options={basicOptions} />
                    </div>
                </div>
            </div>
            <div className="grid">
                <div className="col-4">
                    <DataTable
                        value={annualBilling}
                        stripedRows scrollable header={headerGroupAnnualBilling}
                        scrollHeight="330px" className="p-datatable"
                        emptyMessage="Nenhum registro encontrado." footerColumnGroup={footerGroupAnnualBilling}>
                        <Column field="name" header="name" />
                        <Column field="value" header="Valor" body={formatAnnualBillingValue} />
                    </DataTable>
                </div>
                <div className="col block">
                    <div className="card bg-white px-3 py-1">
                        <Chart type="bar" className="h-full" data={annualBillingChart} options={basicOptions} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DashboardPage;