import { useForm } from 'react-hook-form';
import { useEffect, useState, useRef } from "react";

import { Toast } from 'primereact/toast';
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { FilterMatchMode } from "primereact/api";

import { DataTableHeader } from '../components/DataTableHeader';
import { EmployeeModel } from '../models/EmployeeModel';
import { EmployeeModal } from '../components/modals/EmployeeModal';
import { DeleteModal } from '../components/modals/DeleteModal';

export function EmployeesPage() {
    const toast = useRef<any>(null);
    const [employeeModalText, setEmployeeModalText] = useState<string>("");
    const [displayDeleteModal, setDisplayDeleteModal] = useState<boolean>(false);
    const [displayEmployeeModal, setDisplayEmployeeModal] = useState<boolean>(false);
    const { control, formState: { errors }, handleSubmit, reset, setValue } = useForm({
        defaultValues: EmployeeModel.empty()
    });

    const [employee, setEmployee] = useState<EmployeeModel>(EmployeeModel.empty());
    const [employees, setEmployees] = useState<EmployeeModel[]>([]);
    const [selectedEmployees, setSelectedEmployees] = useState<EmployeeModel[]>([]);
    const [filters, setFilters] = useState({ "global": { value: null, matchMode: FilterMatchMode.CONTAINS } })
    const [globalFilterValue, setGlobalFilterValue] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("http://localhost:3000/api/employees")
            .then(response => response.json())
            .then(data => {
                setEmployees(data);
                setLoading(false);
            });
    }, []);

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

    function renderHeader() {
        return (
            <DataTableHeader
                description="Funcionários"
                filters={filters}
                setFilters={setFilters}
                selectedModels={selectedEmployees}
                globalFilterValue={globalFilterValue}
                setGlobalFilterValue={setGlobalFilterValue}
                showExportButtons={false}
                onClickExportPDF={() => {}}
                onClickExportXLS={() => {}}
                onClickNewItem={() => {
                    setEmployeeModalText("Adicionar funcionário");
                    setEmployee(EmployeeModel.empty());
                    setValue("active", true);
                    setDisplayEmployeeModal(true);
                }}
                onClickUpdateItem={() => {
                    setEmployeeModalText("Alterar funcionário");

                    var selectedEmployee = EmployeeModel.clone(selectedEmployees[0]);
                    setEmployee(selectedEmployee);

                    if (selectedEmployee.name)
                        setValue("name", selectedEmployee.name);
                    if (selectedEmployee.birthDate)
                        setValue("birthDate", selectedEmployee.birthDate)
                    if (selectedEmployee.cpf)
                        setValue("cpf", selectedEmployee.cpf);
                    if (selectedEmployee.id)
                        setValue("id", selectedEmployee.id);
                    if (selectedEmployee.active)
                        setValue("active", selectedEmployee.active);

                    setDisplayEmployeeModal(true);
                }}
                onClickDeleteItem={() => {
                    setDisplayDeleteModal(true);
                }}
            />
        );
    }

    function onClickSave(employee: any) {
        var filteredEmployees = employees.filter(item => item.id != employee.id);
        setSelectedEmployees([]);

        setEmployees([
            ...filteredEmployees,
            employee
        ]);

        toast.current.show({
            severity: 'success',
            summary: 'Sucesso!',
            detail: 'Funcionário foi salvo com sucesso!',
            life: 3000
        });
    }

    function onClickDelete(data: EmployeeModel[]) {
        const employeeUids: string[] = data.map(employee => employee.id);

        fetch("http://localhost:3000/api/employees", {
            method: "DELETE",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ids: employeeUids
            })
        })
            .then(response => response.json())
            .then(() => {
                var filteredEmployees = employees.filter(employee => !employeeUids.includes(employee.id));
                setEmployees(filteredEmployees);
                toast.current.show({
                    severity: 'success',
                    summary: 'Sucesso!',
                    detail: 'Os funcionários foram removidos com sucesso!',
                    life: 3000
                });
            });
    }

    return (
        <>
            <Toast ref={toast} />
            <div className="datatable">
                <div className="datatable card">
                    <DataTable value={employees} paginator className="p-datatable" header={renderHeader()} rows={10}
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
                employeeModalText={employeeModalText}
                displayEmployeeModal={displayEmployeeModal}
                setDisplayEmployeeModal={setDisplayEmployeeModal}
                employee={employee}
                setEmployee={setEmployee}
                onClickSave={onClickSave}
                control={control}
                errors={errors}
                handleSubmit={handleSubmit}
                reset={reset}
                setValue={setValue}
            />

            <DeleteModal
                models={selectedEmployees}
                deleteModalDescription={"Deseja realmente remover os funcionários selecionados?"}
                deleteModalHeader={"Excluir"}
                displayDeleteModal={displayDeleteModal}
                setDisplayDeleteModal={setDisplayDeleteModal}
                onClickDelete={onClickDelete}
            />
        </>
    );
}