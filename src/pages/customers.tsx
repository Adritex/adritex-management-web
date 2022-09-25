import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { FilterMatchMode } from "primereact/api";

import { DataTableHeader } from "../components/DataTableHeader";
import { useEffect, useState } from "react";

export function CustomersPage() {
    const [customers, setCustomers] = useState<any[]>([]);
    const [selectedCustomers, setSelectedCustomers] = useState<any[]>([]);
    const [filters, setFilters] = useState({ "global": { value: null, matchMode: FilterMatchMode.CONTAINS } });
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
                  
                }}
                onClickUpdateItem={() => {
                    
                }}
                onClickDeleteItem={() => {
              
                }}
            />
        );
    }

    return (
        <>
            <div className="datatable">
                <div className="datatable card">
                    <DataTable value={customers} paginator className="p-datatable" header={renderHeader()} rows={10}
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown" rowsPerPageOptions={[5, 10, 25]}
                        dataKey="uid" rowHover selection={selectedCustomers} onSelectionChange={e => setSelectedCustomers(e.value)}
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
        </>
    );
}