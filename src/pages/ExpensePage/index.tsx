import { useEffect, useRef, useState } from "react";
import { ExpenseModel } from "../../models/expenseModel";
import { EXPENSE_ROUTE } from "../../server/configs";

import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { FilterMatchMode } from "primereact/api";
import { DataTableHeader } from "../../components/DataTableHeader";
import { ExpenseModal } from "../../components/modals/ExpenseModal";
import { DeleteModal } from "../../components/modals/DeleteModal";
import { Toast } from "primereact/toast";
import { fetchServer } from "../../server";
import { useAuth } from "../../contexts/authContext";

function ExpensePage() {
    const toast = useRef<any>(null);
    const { userSession } = useAuth();
    const [displayDeleteModal, setDisplayDeleteModal] = useState<boolean>(false);
    const [displayExpenseModal, setDisplayExpenseModal] = useState<boolean>(false);
    const [action, setAction] = useState<'Insert' | 'Update'>('Insert');

    const [expenses, setExpenses] = useState<ExpenseModel[]>([]);
    const [expense, setExpense] = useState<ExpenseModel | null>(null);
    const [selectedExpenses, setSelectedExpenses] = useState<ExpenseModel[]>([]);
    const [filters, setFilters] = useState({ "global": { value: null, matchMode: FilterMatchMode.CONTAINS } })
    const [globalFilterValue, setGlobalFilterValue] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchServer({
            route: EXPENSE_ROUTE,
            method: "GET",
            user: userSession,
        }).then(response => {
            setExpenses(response);
            setLoading(false);
        })
    }, []);

    function renderDataTableHeader() {
        return (
            <DataTableHeader
                description="Despesas"
                filters={filters}
                setFilters={setFilters}
                selectedModels={selectedExpenses}
                globalFilterValue={globalFilterValue}
                setGlobalFilterValue={setGlobalFilterValue}
                showExportButtons={false}
                onClickExportPDF={() => { }}
                onClickExportXLS={() => { }}
                onClickNewItem={() => {
                    setExpense(null);
                    setAction('Insert');
                    setDisplayExpenseModal(true);
                }}
                onClickUpdateItem={() => {
                    var selectedExpense = ExpenseModel.clone(selectedExpenses[0]);
                    setExpense(selectedExpense);
                    setAction('Update');
                    setDisplayExpenseModal(true);
                }}
                onClickDeleteItem={() => {
                    setDisplayDeleteModal(true);
                }}
                otherButtons={() => {}}
            />
        );
    }

    function onSave(expense: ExpenseModel) {
        const filteredExpenses = expenses.filter(item =>
            item.id != expense.id);

        setSelectedExpenses([]);
        setExpenses([...filteredExpenses, expense]);

        toast.current.show({
            severity: 'success',
            summary: 'Sucesso!',
            detail: 'Despesa foi salva com sucesso!',
            life: 3000
        });
    }

    function onDelete(selectedExpenses: ExpenseModel[]) {
        const ids: string[] = selectedExpenses.map(expense => expense.id);

        fetchServer({
            route: EXPENSE_ROUTE,
            method: "DELETE",
            user: userSession,
            body: JSON.stringify({ ids })
        }).then(() => {
            const filteredExpenses = expenses.filter(
                expense => !ids.includes(expense.id)
            );
            setExpenses(filteredExpenses);

            toast.current.show({
                severity: 'success',
                summary: 'Sucesso!',
                detail: 'As despesas selecionadas foram removidas com sucesso!',
                life: 3000
            });
        })
    }

    function balanceBodyTemplate(rowData: ExpenseModel) {
        if (rowData?.value) {
            return Number(rowData.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        }

        return Number(0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    function dateBodyTemplate(rowData: ExpenseModel) {
        return formatDate(rowData.date);
    }

    function formatDate(value: any) {
        if (value && value != "Invalid Date") {
            return new Date(value).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            });
        } else {
            return "Data inválida";
        }
    }

    return (
        <>
            <Toast ref={toast} />
            <div className="datatable">
                <div className="datatable card">
                    <DataTable value={expenses} paginator className="p-datatable" header={renderDataTableHeader()} rows={10}
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown" rowsPerPageOptions={[5, 10, 25]}
                        dataKey="id" rowHover selection={selectedExpenses} onSelectionChange={e => setSelectedExpenses(e.value)}
                        filters={filters} filterDisplay="menu" loading={loading} responsiveLayout="scroll"
                        globalFilterFields={['name', 'description', 'value', 'date']} emptyMessage="Nenhuma despesa encontrada."
                        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} entradas">
                        <Column selectionMode="multiple" headerStyle={{ width: '3em' }}></Column>
                        <Column field="name" header="Nome" sortable style={{ minWidth: '14rem' }} />
                        <Column field="description" header="Descrição" sortable style={{ minWidth: '14rem' }} />
                        <Column field="value" header="Valor" sortable style={{ minWidth: '14rem' }} body={balanceBodyTemplate} />
                        <Column field="date" header="Data" sortable style={{ minWidth: '14rem' }} body={dateBodyTemplate} />
                    </DataTable>
                </div>
            </div>

            <ExpenseModal
                displayExpenseModal={displayExpenseModal}
                setDisplayExpenseModal={setDisplayExpenseModal}
                expense={expense}
                onSave={onSave}
                action={action}
                setAction={setAction}
            />

            <DeleteModal
                models={selectedExpenses}
                deleteModalDescription={"Deseja realmente remover as despesas selecionadas?"}
                deleteModalHeader={"Excluir"}
                displayDeleteModal={displayDeleteModal}
                setDisplayDeleteModal={setDisplayDeleteModal}
                onClickDelete={onDelete}
            />
        </>
    );
}

export default ExpensePage;