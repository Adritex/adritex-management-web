import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { FilterMatchMode } from "primereact/api";
import { Toast } from 'primereact/toast';

import { DataTableHeader } from "../components/DataTableHeader";
import { DeleteModal } from "../components/modals/DeleteModal";
import { useForm } from 'react-hook-form';
import { useEffect, useState, useRef } from "react";
import { PayrollModal } from "../components/modals/PayrollModal";
import { PayrollModel } from "../models/PayrollModel";
import { EmployeeModel } from "../models/EmployeeModel";

export function PaymentsPage() {
    const toast = useRef<any>(null);
    const [payrollModalText, setPayrollModalText] = useState<string>("");
    const [displayDeleteModal, setDisplayDeleteModal] = useState<boolean>(false);
    const [displayPayrollModal, setDisplayPayrollModal] = useState<boolean>(false);
    const { control, formState: { errors }, handleSubmit, reset, setValue } = useForm({
        defaultValues: PayrollModel.empty()
    });

    const [employees, setEmployees] = useState<EmployeeModel[]>([]);
    const [payroll, setPayroll] = useState<PayrollModel>(PayrollModel.empty());
    const [payrolls, setPayrolls] = useState<PayrollModel[]>([]);
    const [selectedPayrolls, setSelectedPayrolls] = useState<PayrollModel[]>([]);
    const [filters, setFilters] = useState({ "global": { value: null, matchMode: FilterMatchMode.CONTAINS } })
    const [globalFilterValue, setGlobalFilterValue] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("http://localhost:3000/api/financial/payrolls")
            .then(response => response.json())
            .then(data => {
                setPayrolls(data);
                setLoading(false);
            });

        fetch("http://localhost:3000/api/employees")
            .then(response => response.json())
            .then(data => {
                setEmployees(data);
            });
    }, []);

    function renderHeader() {
        return (
            <DataTableHeader
                description="Pagamentos"
                filters={filters}
                setFilters={setFilters}
                selectedModels={selectedPayrolls}
                globalFilterValue={globalFilterValue}
                setGlobalFilterValue={setGlobalFilterValue}
                showExportButtons={false}
                onClickExportPDF={() => {}}
                onClickExportXLS={() => {}}
                onClickNewItem={() => {
                    setPayrollModalText("Adicionar pagamento");
                    setPayroll(PayrollModel.empty());
                    setDisplayPayrollModal(true);
                }}
                onClickUpdateItem={() => {
                    setPayrollModalText("Alterar pagamento");

                    var selectedPayroll = PayrollModel.clone(selectedPayrolls[0]);
                    setPayroll(selectedPayroll);
                    
                    if (selectedPayroll.id)
                        setValue("id", selectedPayroll.id);
                    if (selectedPayroll.employee)
                        setValue("employee", selectedPayroll.employee);
                    if(selectedPayroll.employeeUid)
                        setValue("employeeUid", selectedPayroll.employeeUid);
                    if (selectedPayroll.attendanceAward)
                        setValue("attendanceAward", selectedPayroll.attendanceAward);
                    if (selectedPayroll.productionAward)
                        setValue("productionAward", selectedPayroll.productionAward);
                    if (selectedPayroll.overtime)
                        setValue("overtime", selectedPayroll.overtime);
                    if (selectedPayroll.date)
                        setValue("date", selectedPayroll.date);
                    if (selectedPayroll.salary)
                        setValue("salary", selectedPayroll.salary);
                    if (selectedPayroll.salaryToBePaid)
                        setValue("salaryToBePaid", selectedPayroll.salaryToBePaid);

                    setDisplayPayrollModal(true);
                }}
                onClickDeleteItem={() => {
                    setDisplayDeleteModal(true);
                }}
            />
        );
    }

    function onClickSave(data: any) {
        const filteredPayroll = payrolls.filter(item => item.id != data.id);
        setSelectedPayrolls([]);

        setPayrolls([
            ...filteredPayroll,
            data
        ]);

        toast.current.show({
            severity: 'success',
            summary: 'Sucesso!',
            detail: 'Pagamento foi salvo com sucesso!',
            life: 3000
        });
    }

    function onClickDelete(data: PayrollModel[]) {
        const payrollUids: string[] = data.map(payroll => payroll.id);

        fetch("http://localhost:3000/api/financial/payrolls/delete", {
            method: "DELETE",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                uids: payrollUids
            })
        })
            .then(response => response.json())
            .then(() => {
                var filteredPayrolls = payrolls.filter(payroll => !payrollUids.includes(payroll.id));
                setPayrolls(filteredPayrolls);

                toast.current.show({
                    severity: 'success',
                    summary: 'Sucesso!',
                    detail: 'Os pagamentos foram removidos com sucesso!',
                    life: 3000
                });
            });
    }

    function balanceBodyTemplate(rowData: PayrollModel) {
        return rowData.salaryToBePaid?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    function dateBodyTemplate(rowData: PayrollModel) {
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
                    <DataTable value={payrolls} paginator className="p-datatable" header={renderHeader()} rows={10}
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown" rowsPerPageOptions={[5, 10, 25]}
                        dataKey="id" rowHover selection={selectedPayrolls} onSelectionChange={e => setSelectedPayrolls(e.value)}
                        filters={filters} filterDisplay="menu" loading={loading} responsiveLayout="scroll"
                        globalFilterFields={['name', 'description', 'value', 'date']} emptyMessage="Nenhum pagamento encontrado."
                        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} entradas">
                        <Column selectionMode="multiple" headerStyle={{ width: '3em' }}></Column>
                        <Column field="employee.name" header="Cliente" sortable style={{ minWidth: '14rem' }} />
                        <Column field="value" header="Valor" sortable style={{ minWidth: '14rem' }} body={balanceBodyTemplate} />
                        <Column field="date" header="Data" sortable style={{ minWidth: '14rem' }} body={dateBodyTemplate} />
                    </DataTable>
                </div>
            </div>

            <PayrollModal
                payrollModalText={payrollModalText}
                displayPayrollModal={displayPayrollModal}
                setDisplayPayrollModal={setDisplayPayrollModal}
                payroll={payroll}
                setPayroll={setPayroll}
                employees={employees}
                onClickSave={onClickSave}
                control={control}
                errors={errors}
                handleSubmit={handleSubmit}
                reset={reset}
                setValue={setValue}
            />

            <DeleteModal
                models={selectedPayrolls}
                deleteModalDescription={"Deseja realmente remover os pagamentos selecionados?"}
                deleteModalHeader={"Excluir"}
                displayDeleteModal={displayDeleteModal}
                setDisplayDeleteModal={setDisplayDeleteModal}
                onClickDelete={onClickDelete}
            />
        </>
    );
}