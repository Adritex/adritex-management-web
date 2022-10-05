import { useEffect, useState, useRef } from "react";
import { useForm } from 'react-hook-form';
import { StatusType } from "../../enums/statusType";
import { ProductModel } from "../../models/productModel";
import { CustomerModel } from "../../models/customerModel";
import { PRODUCT_ROUTE } from "../../configs/IntegrationServer";
import { CUSTOMER_ROUTE } from "../../configs/IntegrationServer";

import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { FilterMatchMode } from "primereact/api";
import { Toast } from 'primereact/toast';
import { DataTableHeader } from "../../components/DataTableHeader";
import { ProductModal } from "../../components/modals/ProductModal";
import { DeleteModal } from "../../components/modals/DeleteModal";

function ProductPage() {
    const toast = useRef<any>(null);
    const [productModalText, setProductModalText] = useState<string>("");
    const [displayDeleteModal, setDisplayDeleteModal] = useState<boolean>(false);
    const [displayProductModal, setDisplayProductModal] = useState<boolean>(false);
    const { control, formState: { errors }, handleSubmit, reset, setValue } = useForm({
        defaultValues: ProductModel.empty()
    });

    const [customers, setCustomers] = useState<CustomerModel[]>([]);
    const [products, setProducts] = useState<ProductModel[]>([]);
    const [product, setProduct] = useState<ProductModel>(ProductModel.empty());
    const [selectedProducts, setSelectedProducts] = useState<ProductModel[]>([]);
    const [filters, setFilters] = useState({ "global": { value: null, matchMode: FilterMatchMode.CONTAINS } })
    const [globalFilterValue, setGlobalFilterValue] = useState("");
    const [loading, setLoading] = useState(true);

    const cols = [
        { field: 'code', header: 'Code' },
        { field: 'name', header: 'Name' },
        { field: 'category', header: 'Category' },
        { field: 'quantity', header: 'Quantity' }
    ];

    useEffect(() => {
        fetch(PRODUCT_ROUTE, {
            method: "GET"
        }).then(response => {
            return response.json();
        }).then(response => {
            setProducts(response);
            setLoading(false);
        });

        fetch(CUSTOMER_ROUTE, {
            method: "GET"
        }).then(response => {
            return response.json();
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
                    // const doc = new jsPDF();
                    // const items: any[][] = products.map(item => {
                    //     return [
                    //         item.customer?.name,
                    //         item.reference,
                    //         item.of,
                    //         item.description,
                    //         item.amount
                    //     ]
                    // });

                    // autoTable(doc, {
                    //     head: [["Cliente", "Referência", "OF", "Descrição", "Valor total"]],
                    //     body: items
                    // });
                    // doc.save("produtos.pdf");
                }}
                onClickExportXLS={() => { }}
                onClickNewItem={() => {
                    setProductModalText("Adicionar produto");
                    setProduct(ProductModel.empty());
                    setDisplayProductModal(true);
                }}
                onClickUpdateItem={() => {
                    setProductModalText("Alterar produto");

                    var selectedProduct = ProductModel.clone(selectedProducts[0]);
                    setProduct(selectedProduct);

                    if (selectedProduct.id)
                        setValue("id", selectedProduct.id);
                    if (selectedProduct.customer)
                        setValue("customer", selectedProduct.customer);
                    if (selectedProduct.reference)
                        setValue("reference", selectedProduct.reference);
                    if (selectedProduct.of)
                        setValue("of", selectedProduct.of);
                    if (selectedProduct.description)
                        setValue("description", selectedProduct.description);
                    if (selectedProduct.quantity)
                        setValue("quantity", selectedProduct.quantity);
                    if (selectedProduct.unitaryValue)
                        setValue("unitaryValue", selectedProduct.unitaryValue);
                    if (selectedProduct.status)
                        setValue("status", selectedProduct.status);
                    if (selectedProduct.amount)
                        setValue("amount", selectedProduct.amount);
                    if (selectedProduct.image)
                        setValue("image", selectedProduct.image);

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
        console.log(product)
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

        fetch(PRODUCT_ROUTE, {
            method: "DELETE",
            body: JSON.stringify({ ids }),
            headers: { 'Content-Type': 'application/json' },
        }).then(response => {
            return response.json();
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

    function balanceBodyTemplate(rowData: ProductModel) {
        return rowData.amount?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
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
                productModalText={productModalText}
                displayProductModal={displayProductModal}
                setDisplayProductModal={setDisplayProductModal}
                product={product}
                setProduct={setProduct}
                customers={customers}
                onClickSave={onSave}
                control={control}
                errors={errors}
                handleSubmit={handleSubmit}
                reset={reset}
                setValue={setValue}
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