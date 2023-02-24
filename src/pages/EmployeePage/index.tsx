import { useEffect, useState, useRef } from "react";
import { EmployeeModel } from '../../models/employeeModel';

import { Toast } from 'primereact/toast';
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { FilterMatchMode } from "primereact/api";
import { DataTableHeader } from '../../components/DataTableHeader';
import { EmployeeModal } from '../../components/modals/EmployeeModal';
import { DeleteModal } from '../../components/modals/DeleteModal';
import { EMPLOYEE_ROUTE } from '../../server/configs';
import { fetchServer } from '../../server';
import { useAuth } from '../../contexts/authContext';

function EmployeePage() {
    const toast = useRef<any>(null);
    const { userSession } = useAuth();
    const [displayDeleteModal, setDisplayDeleteModal] = useState<boolean>(false);
    const [displayEmployeeModal, setDisplayEmployeeModal] = useState<boolean>(false);
    const [action, setAction] = useState<'Insert' | 'Update'>('Insert');

    const [employees, setEmployees] = useState<EmployeeModel[]>([]);
    const [employee, setEmployee] = useState<EmployeeModel | null>(null);
    const [selectedEmployees, setSelectedEmployees] = useState<EmployeeModel[]>([]);
    const [filters, setFilters] = useState({ "global": { value: null, matchMode: FilterMatchMode.CONTAINS } })
    const [globalFilterValue, setGlobalFilterValue] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
                description="Funcionários"
                filters={filters}
                setFilters={setFilters}
                selectedModels={selectedEmployees}
                globalFilterValue={globalFilterValue}
                setGlobalFilterValue={setGlobalFilterValue}
                showExportButtons={false}
                onClickExportPDF={() => { }}
                onClickExportXLS={() => { }}
                onClickNewItem={() => {
                    setEmployee(null);
                    setAction('Insert');
                    setDisplayEmployeeModal(true);
                }}
                onClickUpdateItem={() => {
                    var selectedEmployee = EmployeeModel.clone(selectedEmployees[0]);
                    setEmployee(selectedEmployee);
                    setAction('Update');
                    setDisplayEmployeeModal(true);
                }}
                onClickDeleteItem={() => {
                    setDisplayDeleteModal(true);
                }}
            />
        );
    }

    function statusBodyTemplate(rowData: EmployeeModel) {
        if (rowData?.active) {
            return <span className={`customer-badge status-qualified`}>Ativo</span>;
        } else {
            return <span className={`customer-badge status-proposal`}>Inativo</span>;
        }
    }

    function dateBodyTemplate(rowData: EmployeeModel) {
        return formatDate(rowData.birthDate);
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

    function onSave(employee: EmployeeModel) {
        var filteredEmployees = employees.filter(item => item.id != employee.id);

        setSelectedEmployees([]);
        setEmployees([...filteredEmployees, employee]);

        toast.current.show({
            severity: 'success',
            summary: 'Sucesso!',
            detail: 'Funcionário foi salvo com sucesso!',
            life: 3000
        });
    }

    function onDelete(selectedEmployees: EmployeeModel[]) {
        const ids: string[] = selectedEmployees.map(employee => employee.id);

        fetchServer({
            route: EMPLOYEE_ROUTE,
            method: "DELETE",
            user: userSession,
            body: JSON.stringify({ ids })
        }).then(() => {
            const filteredEmployees = employees.filter(employee =>
                !ids.includes(employee.id));

            setEmployees(filteredEmployees);

            toast.current.show({
                severity: 'success',
                summary: 'Sucesso!',
                detail: 'Os funcionários selecionados foram removidos com sucesso!',
                life: 3000
            });
        });
    }

    return (
        <>
            <Toast ref={toast} />
            <div className="datatable">
                <div className="datatable card">
                    <DataTable value={employees} paginator className="p-datatable" header={renderDataTableHeader()} rows={10}
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown" rowsPerPageOptions={[5, 10, 25]}
                        dataKey="id" rowHover selection={selectedEmployees} onSelectionChange={e => setSelectedEmployees(e.value)}
                        filters={filters} filterDisplay="menu" loading={loading} responsiveLayout="scroll"
                        globalFilterFields={['name', 'cpf', 'birthDate', 'active']} emptyMessage="Nenhum funcionário encontrado."
                        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} entradas">
                        <Column selectionMode="multiple" headerStyle={{ width: '3em' }}></Column>
                        <Column field="name" header="Name" sortable style={{ minWidth: '14rem' }} />
                        <Column field="cpf" header="CPF" sortable style={{ minWidth: '14rem' }} />
                        <Column field="birthDate" header="Data de nascimento" sortable style={{ minWidth: '14rem' }} body={dateBodyTemplate} />
                        <Column field="active" header="Ativo" sortable style={{ minWidth: '14rem' }} body={statusBodyTemplate} />
                    </DataTable>
                </div>
            </div>

            <EmployeeModal
                action={action}
                setAction={setAction}
                employee={employee}
                onSave={onSave}
                displayEmployeeModal={displayEmployeeModal}
                setDisplayEmployeeModal={setDisplayEmployeeModal}
            />

            <DeleteModal
                models={selectedEmployees}
                deleteModalDescription={"Deseja realmente remover os funcionários selecionados?"}
                deleteModalHeader={"Excluir"}
                displayDeleteModal={displayDeleteModal}
                setDisplayDeleteModal={setDisplayDeleteModal}
                onClickDelete={onDelete}
            />
        </>
    );
}

export default EmployeePage;