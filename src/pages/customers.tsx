import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { FilterMatchMode } from "primereact/api";
import { Toast } from 'primereact/toast';

import { useEffect, useState, useRef } from "react";
import { useForm } from 'react-hook-form';
import { DataTableHeader } from "../components/DataTableHeader";
import { CustomerModal } from "../components/modals/CustomerModal";
import { CustomerModel } from "../models/CustomerModel";
import { DeleteModal } from "../components/modals/DeleteModal";

export function CustomersPage() {
    const toast = useRef<any>(null);
    const [customerModalText, setCustomerModalText] = useState<string>("");
    const [displayDeleteModal, setDisplayDeleteModal] = useState<boolean>(false);
    const [displayCustomerModal, setDisplayCustomerModal] = useState<boolean>(false);
    const { control, formState: { errors }, handleSubmit, reset, setValue } = useForm({
        defaultValues: CustomerModel.empty()
    });
    const [customers, setCustomers] = useState<CustomerModel[]>([]);
    const [customer, setCustomer] = useState<CustomerModel>(CustomerModel.empty());
    const [selectedCustomers, setSelectedCustomers] = useState<CustomerModel[]>([]);
    const [filters, setFilters] = useState({ "global": { value: null, matchMode: FilterMatchMode.CONTAINS } })
    const [globalFilterValue, setGlobalFilterValue] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("http://localhost:3000/api/customers")
            .then(response => response.json())
            .then(data => {
                setCustomers(data);
                setLoading(false);
            });
    }, []);

    function renderHeader() {
        return (
            <DataTableHeader
            description="Clientes"
            filters={filters}
            setFilters={setFilters}
            selectedModels={selectedCustomers}
            globalFilterValue={globalFilterValue}
            setGlobalFilterValue={setGlobalFilterValue}
            showExportButtons={false}
            onClickExportPDF={() => {}}
            onClickExportXLS={() => {}}
            onClickNewItem={() => {
                setCustomerModalText("Adicionar cliente");
                setCustomer(CustomerModel.empty());
                setDisplayCustomerModal(true);
            }}
            onClickUpdateItem={() => {
                setCustomerModalText("Alterar cliente");

                var selectedCustomer = CustomerModel.clone(selectedCustomers[0]);
                setCustomer(selectedCustomer);

                if (selectedCustomer.name)
                    setValue("name", selectedCustomer.name);
                if (selectedCustomer.initials)
                    setValue("initials", selectedCustomer.initials)
                if (selectedCustomer.cnpj)
                    setValue("cnpj", selectedCustomer.cnpj);
                if (selectedCustomer.id)
                    setValue("id", selectedCustomer.id);

                setDisplayCustomerModal(true);
            }}
            onClickDeleteItem={() => {
                setDisplayDeleteModal(true);
            }}
        />
        );
    }

    function onClickSave(customer: any) {
        console.log(customer);
        var filteredCustomers = customers.filter(item => item.id != customer.id);
        setSelectedCustomers([]);

        setCustomers([
            ...filteredCustomers,
            customer
        ]);

        toast.current.show({ severity: 'success', summary: 'Sucesso!', detail: 'Cliente foi salvo com sucesso!', life: 3000 });
    }

    function onClickDelete(data: CustomerModel[]) {
        const customerUids: string[] = data.map(customer => customer.id);

        fetch("http://localhost:3000/api/customers", {
            method: "DELETE",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ids: customerUids
            })
        })
            .then(response => response.json())
            .then(() => {
                var filteredCustomers = customers.filter(customer => !customerUids.includes(customer.id));
                setCustomers(filteredCustomers);
                toast.current.show({ severity: 'success', summary: 'Sucesso!', detail: 'Os clientes foram removidos com sucesso!', life: 3000 });
            });
    }

    return (
         <>
            <Toast ref={toast} />
            <div className="datatable">
                <div className="datatable card">
                    <DataTable value={customers} paginator className="p-datatable" header={renderHeader()} rows={10}
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
                customerModalText={customerModalText}
                displayCustomerModal={displayCustomerModal}
                setDisplayCustomerModal={setDisplayCustomerModal}
                customer={customer}
                setCustomer={setCustomer}
                onClickSave={onClickSave}
                control={control}
                errors={errors}
                handleSubmit={handleSubmit}
                reset={reset}
                setValue={setValue}
            />

            <DeleteModal
                models={selectedCustomers}
                deleteModalDescription={"Deseja realmente remover os clientes selecionados?"}
                deleteModalHeader={"Excluir"}
                displayDeleteModal={displayDeleteModal}
                setDisplayDeleteModal={setDisplayDeleteModal}
                onClickDelete={onClickDelete}
            />
        </>
    );
}