import { useEffect, useState, useRef } from "react";
import { CustomerModel } from "../../models/customerModel";

import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { FilterMatchMode } from "primereact/api";
import { Toast } from 'primereact/toast';
import { DataTableHeader } from "../../components/DataTableHeader";
import { CustomerModal } from "../../components/modals/CustomerModal";
import { DeleteModal } from "../../components/modals/DeleteModal";
import { CUSTOMER_ROUTE } from "../../server/configs";
import { fetchServer } from "../../server";
import { useAuth } from "../../contexts/authContext";

function CustomerPage() {
    const toast = useRef<any>(null);
    const { userSession } = useAuth();
    const [displayDeleteModal, setDisplayDeleteModal] = useState<boolean>(false);

    const [displayCustomerModal, setDisplayCustomerModal] = useState<boolean>(false);
    const [action, setAction] = useState<'Insert' | 'Update'>('Insert');

    const [customers, setCustomers] = useState<CustomerModel[]>([]);
    const [customer, setCustomer] = useState<CustomerModel | null>(null);
    const [selectedCustomers, setSelectedCustomers] = useState<CustomerModel[]>([]);
    const [filters, setFilters] = useState({ "global": { value: null, matchMode: FilterMatchMode.CONTAINS } })
    const [globalFilterValue, setGlobalFilterValue] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchServer({
            route: CUSTOMER_ROUTE,
            method: "GET",
            user: userSession,
        }).then(response => {
            setCustomers(response);
            setLoading(false);
        });
    }, []);

    function renderDataTableHeader() {
        return (
            <DataTableHeader
                description="Clientes"
                filters={filters}
                setFilters={setFilters}
                selectedModels={selectedCustomers}
                globalFilterValue={globalFilterValue}
                setGlobalFilterValue={setGlobalFilterValue}
                showExportButtons={false}
                onClickExportPDF={() => { }}
                onClickExportXLS={() => { }}
                onClickNewItem={() => {
                    setCustomer(null);
                    setAction('Insert');
                    setDisplayCustomerModal(true);
                }}
                onClickUpdateItem={() => {
                    var selectedCustomer = CustomerModel.clone(selectedCustomers[0]);
                    setCustomer(selectedCustomer);
                    setAction('Update');
                    setDisplayCustomerModal(true);
                }}
                onClickDeleteItem={() => {
                    setDisplayDeleteModal(true);
                }}
                otherButtons={() => {}}
            />
        );
    }

    function onSave(customer: CustomerModel) {
        var filteredCustomers = customers.filter(item => item.id != customer.id);

        setSelectedCustomers([]);
        setCustomers([...filteredCustomers, customer]);

        toast.current.show({
            severity: 'success',
            summary: 'Sucesso!',
            detail: 'Cliente foi salvo com sucesso!',
            life: 3000
        });
    }

    function onDelete(selectedCustomers: CustomerModel[]) {
        const ids: string[] = selectedCustomers.map(customer => customer.id);

        fetchServer({
            route: CUSTOMER_ROUTE,
            method: "DELETE",
            user: userSession,
            body: JSON.stringify({ ids })
        }).then(response => {
            var filteredCustomers = customers;
            
            for(const id in ids) {
                if(response.idsWithError.length == 0 || !response.idsWithError.includes(ids[id])) {
                    filteredCustomers = filteredCustomers.filter(customer =>
                        customer.id != ids[id]);
                }

                toast.current.show({
                    severity: response.error ? 'error' : 'success',
                    summary: response.error ? 'Erro!' : 'Sucesso!',
                    detail: response.error ? response.error : 'Os clientes selecionados foram removidos com sucesso!',
                    life: response.error ? 8000: 3000
                });
            }

            setCustomers(filteredCustomers);
        });
    }

    return (
        <>
            <Toast ref={toast} />
            <div className="datatable">
                <div className="datatable card">
                    <DataTable value={customers} paginator className="p-datatable" header={renderDataTableHeader()} rows={10}
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown" rowsPerPageOptions={[5, 10, 25]}
                        dataKey="id" rowHover selection={selectedCustomers} onSelectionChange={e => setSelectedCustomers(e.value)}
                        filters={filters} filterDisplay="menu" loading={loading} responsiveLayout="scroll"
                        globalFilterFields={['name', 'initials', 'cnpj']} emptyMessage="Nenhum cliente encontrado."
                        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} entradas">
                        <Column selectionMode="multiple" headerStyle={{ width: '3em' }}></Column>
                        <Column field="initials" header="Sigla" sortable style={{ minWidth: '14rem' }} />
                        <Column field="name" header="Nome" sortable style={{ minWidth: '14rem' }} />
                        <Column field="cnpj" header="CNPJ" sortable style={{ minWidth: '14rem' }} />
                    </DataTable>
                </div>
            </div>

            <CustomerModal
                action={action}
                setAction={setAction}
                customer={customer}
                onSave={onSave}
                displayCustomerModal={displayCustomerModal}
                setDisplayCustomerModal={setDisplayCustomerModal}
            />

            <DeleteModal
                models={selectedCustomers}
                deleteModalDescription={"Deseja realmente remover os clientes selecionados?"}
                deleteModalHeader={"Excluir"}
                displayDeleteModal={displayDeleteModal}
                setDisplayDeleteModal={setDisplayDeleteModal}
                onClickDelete={onDelete}
            />
        </>
    )
}

export default CustomerPage;