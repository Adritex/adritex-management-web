import { useEffect, useState, useRef, useContext } from "react";
import { useForm } from 'react-hook-form';
import { StatusType } from "../../enums/statusType";
import { ProductModel } from "../../models/productModel";
import { CustomerModel } from "../../models/customerModel";
import { PRODUCT_ROUTE } from "../../server/configs";
import { CUSTOMER_ROUTE } from "../../server/configs";

import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { FilterMatchMode } from "primereact/api";
import { Toast } from 'primereact/toast';
import { DataTableHeader } from "../../components/DataTableHeader";
import { ProductModal } from "../../components/modals/ProductModal";
import { DeleteModal } from "../../components/modals/DeleteModal";
import { fetchServer } from "../../server";
import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable';
import { useAuth } from "../../contexts/authContext";

function ProductPage() {
    const toast = useRef<any>(null);
    const { userSession } = useAuth();
    const [productModalText, setProductModalText] = useState<string>("");
    const [displayDeleteModal, setDisplayDeleteModal] = useState<boolean>(false);
    const [displayProductModal, setDisplayProductModal] = useState<boolean>(false);
    const [action, setAction] = useState<'Insert' | 'Update'>('Insert');

    const [customers, setCustomers] = useState<CustomerModel[]>([]);
    const [products, setProducts] = useState<ProductModel[]>([]);
    const [product, setProduct] = useState<ProductModel | null>(null);
    const [selectedProducts, setSelectedProducts] = useState<ProductModel[]>([]);
    const [filters, setFilters] = useState({ "global": { value: null, matchMode: FilterMatchMode.CONTAINS } })
    const [globalFilterValue, setGlobalFilterValue] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchServer({
            route: PRODUCT_ROUTE,
            method: "GET",
            user: userSession,
        }).then(response => {
            setProducts(response);
            setLoading(false);
        });

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
                description="Produtos"
                filters={filters}
                setFilters={setFilters}
                selectedModels={selectedProducts}
                globalFilterValue={globalFilterValue}
                setGlobalFilterValue={setGlobalFilterValue}
                showExportButtons={true}
                onClickExportPDF={() => {
                    const doc = new jsPDF();
                    const items: any[][] = products.map(item => {
                        return [
                            customers.find(customer => customer.id == item.idCustomer)?.name,
                            item.reference,
                            item.of,
                            item.description,
                            item.amount
                        ]
                    });

                    autoTable(doc, {
                        head: [["Cliente", "Referência", "OF", "Descrição", "Valor total"]],
                        body: items
                    });
                    doc.save("produtos.pdf");
                }}
                onClickExportXLS={() => { }}
                onClickNewItem={() => {
                    setProduct(null);
                    setAction('Insert');
                    setDisplayProductModal(true);
                }}
                onClickUpdateItem={() => {
                    var selectedProduct = ProductModel.clone(selectedProducts[0]);
                    selectedProduct.customer = customers.find(item => item.id == selectedProduct.idCustomer) || null;
                    setProduct(selectedProduct);
                    setAction('Update');
                    setDisplayProductModal(true);
                }}
                onClickDeleteItem={() => {
                    setDisplayDeleteModal(true);
                }}
            />
        );
    }

    function onSave(product: ProductModel) {
        const filteredProducts = products.filter(item => item.id != product.id);
        
        setSelectedProducts([]);
        setProducts([...filteredProducts, product]);

        toast.current.show({
            severity: 'success',
            summary: 'Sucesso!',
            detail: 'O produto foi salvo com sucesso!',
            life: 3000
        });
    }

    function onDelete(selectedProducts: ProductModel[]) {
        const ids: string[] = selectedProducts.map(item => item.id);

        if (ids.length > 0) {
            fetchServer({
                route: PRODUCT_ROUTE,
                method: "DELETE",
                user: userSession,
                body: JSON.stringify({ ids })
            }).then(() => {
                const filteredProducts = products.filter(
                    item => !ids.includes(item.id)
                );

                setProducts(filteredProducts);

                toast.current.show({
                    severity: 'success',
                    summary: 'Sucesso!',
                    detail: 'Os produtos selecionados foram removidos com sucesso!',
                    life: 3000
                });
            });
        }
    }

    function balanceBodyTemplate(rowData: ProductModel) {
        if(rowData.amount) {
            return Number(rowData.amount)?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        }

        return 'Valor não informado';
    }

    function statusBodyTemplate(rowData: ProductModel) {
        if (rowData.status == StatusType.None || rowData.status == StatusType.Pending) {
            return <span className={`customer-badge status-proposal`}>Pendente</span>
        } else if (rowData.status == StatusType.Progress) {
            return <span className={`customer-badge status-new`}>Em andamento</span>
        } else if (rowData.status == StatusType.Finished) {
            return <span className={`customer-badge status-qualified`}>Finalizado</span>
        } else if (rowData.status == StatusType.Canceled) {
            return <span className={`customer-badge status-unqualified`}>Cancelado</span>
        }
    }

    function dateBodyTemplate(rowData: ProductModel) {
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
            return "";
        }
    }

    function customerName(rowData: ProductModel) {
        const customer = customers.find(customer => customer.id == rowData.idCustomer);

        if (customer) {
            return customer.name;
        }

        return "Cliente não encontrado";
    }

    return (
        <>
            <Toast ref={toast} />
            <div className="datatable">
                <div className="datatable card">
                    <DataTable value={products} paginator className="p-datatable" header={renderDataTableHeader()} rows={10}
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown" rowsPerPageOptions={[5, 10, 25]}
                        dataKey="id" rowHover selection={selectedProducts} onSelectionChange={e => setSelectedProducts(e.value)}
                        filters={filters} filterDisplay="menu" loading={loading} responsiveLayout="scroll"
                        globalFilterFields={['customer.name', 'reference', 'of', 'description', 'amount', 'status']} emptyMessage="Nenhum produto encontrado."
                        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} entradas">
                        <Column selectionMode="multiple" headerStyle={{ width: '3em' }}></Column>
                        <Column field="customer" header="Cliente" sortable style={{ minWidth: '14rem' }} body={customerName} />
                        <Column field="reference" header="Referência" sortable style={{ minWidth: '14rem' }} />
                        <Column field="of" header="OF" sortable style={{ minWidth: '14rem' }} />
                        <Column field="description" header="Descrição" sortable style={{ minWidth: '14rem' }} />
                        <Column field="amount" header="Valor total" sortable style={{ minWidth: '14rem' }} body={balanceBodyTemplate} />
                        <Column field="status" header="Situação" sortable style={{ minWidth: '14rem' }} body={statusBodyTemplate} />
                        <Column field="date" header="Data" sortable style={{ minWidth: '14rem' }} body={dateBodyTemplate} />
                    </DataTable>
                </div>
            </div>

            <ProductModal
                displayProductModal={displayProductModal}
                setDisplayProductModal={setDisplayProductModal}
                product={product}
                customers={customers}
                onSave={onSave}
                action={action}
                setAction={setAction}
            />

            <DeleteModal
                models={selectedProducts}
                deleteModalDescription={"Deseja realmente remover os produtos selecionados?"}
                deleteModalHeader={"Excluir"}
                displayDeleteModal={displayDeleteModal}
                setDisplayDeleteModal={setDisplayDeleteModal}
                onClickDelete={onDelete}
            />
        </>
    );
}

export default ProductPage;