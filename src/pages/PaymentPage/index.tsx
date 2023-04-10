import { useEffect, useState, useRef } from "react";
import { PayrollModel } from '../../models/payrollModel';
import { EmployeeModel } from '../../models/employeeModel';

import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { FilterMatchMode } from "primereact/api";
import { Toast } from 'primereact/toast';
import { DataTableHeader } from "../../components/DataTableHeader";
import { PayrollModal } from "../../components/modals/PayrollModal";
import { DeleteModal } from "../../components/modals/DeleteModal";
import { EMPLOYEE_ROUTE, PAYROLLS_ROUTE } from '../../server/configs';
import { fetchServer } from '../../server';
import { useAuth } from '../../contexts/authContext';

function PaymentPage() {
    const toast = useRef<any>(null);
    const { userSession } = useAuth();
    const [displayDeleteModal, setDisplayDeleteModal] = useState<boolean>(false);
    const [displayPayrollModal, setDisplayPayrollModal] = useState<boolean>(false);
    const [action, setAction] = useState<'Insert' | 'Update'>('Insert');

    const [employees, setEmployees] = useState<EmployeeModel[]>([]);
    const [payrolls, setPayrolls] = useState<PayrollModel[]>([]);
    const [payroll, setPayroll] = useState<PayrollModel | null>(null);
    const [selectedPayrolls, setSelectedPayrolls] = useState<PayrollModel[]>([]);
    const [filters, setFilters] = useState({ "global": { value: null, matchMode: FilterMatchMode.CONTAINS } })
    const [globalFilterValue, setGlobalFilterValue] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchServer({
            route: PAYROLLS_ROUTE,
            method: "GET",
            user: userSession,
        }).then(response => {
            setPayrolls(response);
            setLoading(false);
        });

        fetchServer({
            route: EMPLOYEE_ROUTE,
            method: "GET",
            user: userSession,
        }).then(response => {
            setEmployees(response);
            setLoading(false);
        });
    }, []);

    function renderDataTableHeader() {
        return (
            <DataTableHeader
                description="Folhas de pagamento"
                filters={filters}
                setFilters={setFilters}
                selectedModels={selectedPayrolls}
                globalFilterValue={globalFilterValue}
                setGlobalFilterValue={setGlobalFilterValue}
                showExportButtons={false}
                onClickExportPDF={() => { }}
                onClickExportXLS={() => { }}
                onClickNewItem={() => {
                    setPayroll(null);
                    setAction('Insert');
                    setDisplayPayrollModal(true);
                }}
                onClickUpdateItem={() => {
                    var selectedPayroll = PayrollModel.clone(selectedPayrolls[0]);
                    selectedPayroll.employee = employees.find(item => item.id == selectedPayroll.idEmployee) || null;
                    setPayroll(selectedPayroll);
                    setAction('Update');
                    setDisplayPayrollModal(true);
                }}
                onClickDeleteItem={() => {
                    setDisplayDeleteModal(true);
                }}
                otherButtons={() => {}}
            />
        );
    }

    function onSave(payroll: PayrollModel) {
        const filteredPayroll = payrolls.filter(
            item => item.id != payroll.id
        );

        setSelectedPayrolls([]);
        setPayrolls([...filteredPayroll, payroll]);

        toast.current.show({
            severity: 'success',
            summary: 'Sucesso!',
            detail: 'Folha de pagamento foi salva com sucesso!',
            life: 3000
        });
    }

    function onDelete(selectedPayrolls: PayrollModel[]) {
        const ids: string[] = selectedPayrolls.map(item => item.id);

        fetchServer({
            route: PAYROLLS_ROUTE,
            method: "DELETE",
            user: userSession,
            body: JSON.stringify({ ids })
        }).then(() => {
            const filteredPayrolls = payrolls.filter(
                item => !ids.includes(item.id)
            );

            setPayrolls(filteredPayrolls);

            toast.current.show({
                severity: 'success',
                summary: 'Sucesso!',
                detail: 'As folhas de pagamentos selecionadas foram removidas com sucesso!',
                life: 3000
            });
        });
    }

    function employeeName(rowData: PayrollModel) {
        const employee = employees.find(employee => employee.id == rowData.idEmployee);

        if (employee) {
            return employee.name;
        }

        return "Funcionário não encontrado";
    }

    function balanceBodyTemplate(rowData: PayrollModel) {
        if(rowData?.salaryToBePaid) {
            return Number(rowData.salaryToBePaid).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        }

        return Number(0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    function dateBodyTemplate(rowData: PayrollModel) {
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
                    <DataTable value={payrolls} paginator className="p-datatable" header={renderDataTableHeader()} rows={10}
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown" rowsPerPageOptions={[5, 10, 25]}
                        dataKey="id" rowHover selection={selectedPayrolls} onSelectionChange={e => setSelectedPayrolls(e.value)}
                        filters={filters} filterDisplay="menu" loading={loading} responsiveLayout="scroll"
                        globalFilterFields={['name', 'description', 'value', 'date']} emptyMessage="Nenhum pagamento encontrado."
                        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} entradas">
                        <Column selectionMode="multiple" headerStyle={{ width: '3em' }}></Column>
                        <Column field="employee" header="Funcionário" sortable style={{ minWidth: '14rem' }} body={employeeName} />
                        <Column field="value" header="Valor" sortable style={{ minWidth: '14rem' }} body={balanceBodyTemplate} />
                        <Column field="date" header="Data" sortable style={{ minWidth: '14rem' }} body={dateBodyTemplate} />
                    </DataTable>
                </div>
            </div>

            <PayrollModal
                displayPayrollModal={displayPayrollModal}
                setDisplayPayrollModal={setDisplayPayrollModal}
                payroll={payroll}
                employees={employees}
                onSave={onSave}
                action={action}
                setAction={setAction}
            />

            <DeleteModal
                models={selectedPayrolls}
                deleteModalDescription={"Deseja realmente remover os pagamentos selecionados?"}
                deleteModalHeader={"Excluir"}
                displayDeleteModal={displayDeleteModal}
                setDisplayDeleteModal={setDisplayDeleteModal}
                onClickDelete={onDelete}
            />
        </>
    );
}

export default PaymentPage;