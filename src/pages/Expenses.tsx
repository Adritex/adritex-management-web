import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { FilterMatchMode } from "primereact/api";

import { useEffect, useRef, useState } from "react";
import { DataTableHeader } from "../components/DataTableHeader";
import { ExpenseModel } from "../models/ExpenseModel";
import { useForm } from "react-hook-form";
import { Toast } from "primereact/toast";
import { DeleteModal } from "../components/modals/DeleteModal";
import { ExpenseModal } from "../components/modals/ExpenseModal";

export function ExpensesPage() {
    const toast = useRef<any>(null);
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
        fetch("http://localhost:3000/api/financial/expenses")
            .then(response => response.json())
            .then(data => {
                setExpenses(data);
                setLoading(false);
            });
    }, []);

    function renderHeader() {
        return (
            <DataTableHeader
                description="Despesas"
                filters={filters}
                setFilters={setFilters}
                selectedModels={selectedExpenses}
                globalFilterValue={globalFilterValue}
                setGlobalFilterValue={setGlobalFilterValue}
                showExportButtons={false}
                onClickExportPDF={() => {}}
                onClickExportXLS={() => {}}
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

    function onClickSave(expense: any) {
        const filteredExpense = expenses.filter(item => item.id != expense.id);
        setSelectedExpenses([]);

        setExpenses([
            ...filteredExpense,
            expense
        ]);

        toast.current.show({
            severity: 'success',
            summary: 'Sucesso!',
            detail: 'Despesa foi salva com sucesso!',
            life: 3000
        });
    }

    function onClickDelete(data: ExpenseModel[]) {
        const expenseUids: string[] = data.map(expense => expense.id);

        fetch("http://localhost:3000/api/financial/expenses", {
            method: "DELETE",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ids: expenseUids
            })
        })
            .then(response => response.json())
            .then(() => {
                var filteredExpenses = expenses.filter(expense => !expenseUids.includes(expense.id));
                setExpenses(filteredExpenses);

                toast.current.show({
                    severity: 'success',
                    summary: 'Sucesso!',
                    detail: 'As despesas foram removidas com sucesso!',
                    life: 3000
                });
            });
    }

    function balanceBodyTemplate(rowData: ExpenseModel) {
        return rowData.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    function dateBodyTemplate(rowData: ExpenseModel) {
        return formatDate(rowData.date);
    }

    const formatDate = (value: any) => {
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
                    <DataTable value={expenses} paginator className="p-datatable" header={renderHeader()} rows={10}
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
                onClickSave={onClickSave}
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
                onClickDelete={onClickDelete}
            />
        </>
    );
}