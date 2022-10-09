import { useContext, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { ExpenseModel } from "../../models/expenseModel";
import { EXPENSE_ROUTE } from "../../server/configs";

import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { FilterMatchMode } from "primereact/api";
import { DataTableHeader } from "../../components/DataTableHeader";
import { ExpenseModal } from "../../components/modals/ExpenseModal";
import { DeleteModal } from "../../components/modals/DeleteModal";
import { Toast } from "primereact/toast";
import { AuthContext } from "../../contexts/authContext";
import { fetchServer } from "../../server";

function ExpensePage() {
    const toast = useRef<any>(null);
    const { user } = useContext(AuthContext);
    const [expenseModalText, setExpenseModalText] = useState<string>("");
    const [displayDeleteModal, setDisplayDeleteModal] = useState<boolean>(false);
    const [displayExpenseModal, setDisplayExpenseModal] = useState<boolean>(false);
    const { control, formState: { errors }, handleSubmit, reset, setValue } = useForm({
        defaultValues: ExpenseModel.empty()
    });
    const [expense, setExpense] = useState<ExpenseModel>(ExpenseModel.empty);
    const [expenses, setExpenses] = useState<ExpenseModel[]>([]);
    const [selectedExpenses, setSelectedExpenses] = useState<ExpenseModel[]>([]);
    const [filters, setFilters] = useState({ "global": { value: null, matchMode: FilterMatchMode.CONTAINS } })
    const [globalFilterValue, setGlobalFilterValue] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchServer({
            route: EXPENSE_ROUTE,
            method: "GET",
            user: user,
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
                    setExpenseModalText("Adicionar despesa");
                    setExpense(ExpenseModel.empty());
                    setDisplayExpenseModal(true);
                }}
                onClickUpdateItem={() => {
                    setExpenseModalText("Alterar despesa");

                    var selectedExpense = ExpenseModel.clone(selectedExpenses[0]);
                    setExpense(selectedExpense);

                    if (selectedExpense.id)
                        setValue("id", selectedExpense.id);
                    if (selectedExpense.name)
                        setValue("name", selectedExpense.name);
                    if (selectedExpense.description)
                        setValue("description", selectedExpense.description);
                    if (selectedExpense.date)
                        setValue("date", selectedExpense.date);
                    if (selectedExpense.value)
                        setValue("value", selectedExpense.value);

                    setDisplayExpenseModal(true);
                }}
                onClickDeleteItem={() => {
                    setDisplayDeleteModal(true);
                }}
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
            user: user,
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
        return rowData.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
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
                expenseModalText={expenseModalText}
                displayExpenseModal={displayExpenseModal}
                setDisplayExpenseModal={setDisplayExpenseModal}
                expense={expense}
                setExpense={setExpense}
                onClickSave={onSave}
                control={control}
                errors={errors}
                handleSubmit={handleSubmit}
                reset={reset}
                setValue={setValue}
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