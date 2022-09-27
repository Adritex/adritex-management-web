import { useEffect, useRef, useState } from "react";
import { StatusType } from "../enums/StatusType";
import { ProductOrderModel } from "../models/ProductOrderModel";
import { ProductModel } from "../models/ProductModel";
import { PickList, PickListChangeParams } from 'primereact/picklist';
import { SelectButton } from 'primereact/selectbutton';
import { Image } from 'primereact/image';
import { PriorityType } from "../enums/PriorityType";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { ConfirmFinishedOrderModal } from "../components/modals/ConfirmFinishedOrderModal";

export function OrdersPage() {
    const toast = useRef<any>(null);
    const [source, setSource] = useState<ProductModel[]>([]);
    const [target, setTarget] = useState<ProductModel[]>([]);
    const [productOrders, setProductOrders] = useState<ProductOrderModel[]>([]);
    const [displayConfirmFinishedOrderModal, setDisplayConfirmFinishedOrderModal] = useState<boolean>(false);
    const [selectedProductOrder, setSelectedProductOrder] = useState<ProductOrderModel>(ProductOrderModel.empty());
    const priorityOptions = ["B", "M", "A"];

    useEffect(() => {
        fetch("/api/demand/products/orders")
            .then(response => response.json())
            .then((products: ProductModel[]) => {
                fetch("/api/demand/orders")
                    .then(response => response.json())
                    .then((productOrders: ProductOrderModel[]) => {
                        const targetProducts: ProductModel[] = [];
                        const productOrdersTarget: ProductOrderModel[] = [];

                        productOrders.forEach((productOrderItem: ProductOrderModel) => {
                            const productOrder = ProductOrderModel.clone(productOrderItem);
                            const product = products.find(item => item.id == productOrderItem.productUid);

                            if (product) {
                                productOrder.setProduct(product);
                                targetProducts.push(product);
                            }

                            products = products.filter(item => item.id != productOrder.productUid);
                            productOrdersTarget.push(productOrder);
                        });

                        setSource(products);
                        setTarget(targetProducts);
                        setProductOrders(productOrdersTarget);
                    });
            });
    }, []);

    const onChange = (event: PickListChangeParams) => {
        setSource(event.source.map((product: ProductModel) => {
            product.status = StatusType.Pending;
            return product;
        }));

        setTarget(event.target.map((product: ProductModel, index: number) => {
            product.status = StatusType.Progress;
            return product;
        }));

        setProductOrders(event.target.map((product: ProductModel, index: number) => {
            product.status = StatusType.Progress;
            const productOrder = new ProductOrderModel(
                "", product.id,
                PriorityType.Low,
                index
            );
            productOrder.setProduct(product);

            return productOrder;
        }));
    }

    const sourceItemTemplate = (item: ProductModel) => {
        return (
            <div className="product-item" key={item.id}>
                <div className="image-container">
                    <Image src={item.image?.toString()} alt={item.description} preview />
                </div>
                <div className="product-list-detail">
                    <h6 className="mb-2">{item.description}</h6>
                    <span className="product-category">
                        <b>Cliente: </b>{item.customer?.name}
                        <br />
                        <b>Referência: </b>{item.reference}
                        <br />
                        <b>OF: </b>{item.of}
                    </span>
                </div>
                <div className="product-list-action">
                    <h6 className="mb-2">{formatCurrency(item.amount)}</h6>
                    {getStatus(item)}
                </div>
            </div>
        );
    }

    const targetItemTemplate = (item: ProductModel) => {
        return (
            <div className="product-item" key={item.id}>
                <div className="image-container">
                    <Image src={item.image?.toString()} alt={item.description} preview />
                </div>
                <div className="product-list-detail">
                    <h6 className="mb-2">{item.description}</h6>
                    <span className="product-category">
                        <b>Cliente: </b>{item.customer?.name}
                        <br />
                        <b>Referência: </b>{item.reference}
                        <br />
                        <b>OF: </b>{item.of}
                    </span>
                </div>
                <div className="product-list-action">
                    <Button label="Finalizar ordem"
                        icon="pi pi-check"
                        className="p-button-sm p-button-outlined p-button-danger hover:bg-red-500 hover:text-white"
                        onClick={() => {
                            const productOrder = productOrders.find(productOrder => productOrder.productUid == item.id);
                            if (productOrder) {
                                setSelectedProductOrder(productOrder);
                            }
                            setDisplayConfirmFinishedOrderModal(true);
                        }}
                    />
                    <h6 className="mb-2">{formatCurrency(item.amount)}</h6>
                    {getStatus(item)}
                    <SelectButton
                        value={productOrders.find(productOrder => productOrder.productUid == item.id)?.priorityStr}
                        className="mt-3"
                        options={priorityOptions}
                        itemTemplate={justifyTemplate}
                        onChange={(event) => {
                            const productOrder = productOrders.find(productOrder => productOrder.productUid == item.id);
                            if (productOrder) {
                                productOrder.setPriority(event.value);
                            }
                        }}
                    />
                </div>
            </div>
        );
    }


    const justifyTemplate = (option: string) => {
        return <small>{option}</small>;
    }

    const formatCurrency = (value: number | undefined) => {
        return value?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    const getStatus = (item: any) => {
        if (item.status == StatusType.None || item.status == StatusType.Pending) {
            return <span className={`customer-badge status-proposal`}>Pendente</span>
        } else if (item.status == StatusType.Progress) {
            return <span className={`customer-badge status-new`}>Em andamento</span>
        }
    }

    function onConfirmFinishedOrder(date: string) {
        fetch("/api/demand/orders/finishedOrder", {
            method: "POST",
            body: JSON.stringify({
                order: selectedProductOrder,
                date: date
            })
        }).then(response => response.json())
            .then((response) => {
                const productOrder: ProductOrderModel = response.data;
                const filteredTarget = target.filter(item => item.id != productOrder.productUid);
                setTarget(filteredTarget);

                toast.current.show({ severity: 'success', summary: 'Sucesso!', detail: 'Ordem de produção finalizada com sucesso!', life: 3000 });
            });
    }

    return (
        <>
            <Toast ref={toast} />
            <div className="picklist">
                <div className="picklist card">
                    <div className="w-full flex justify-content-between mb-3">
                        <h5>Ordem de produção</h5>
                        <Button
                            label="Salvar alterações"
                            icon="pi pi-check"
                            onClick={() => {
                                fetch("/api/demand/orders/add", {
                                    method: "POST",
                                    body: JSON.stringify(productOrders)
                                })
                                    .then(response => response.json())
                                    .then(data => {
                                        toast.current.show({ severity: 'success', summary: 'Sucesso!', detail: 'Ordem de produção alterada!', life: 3000 });
                                    })
                            }}
                        />
                    </div>
                    <PickList
                        source={source} target={target}
                        sourceItemTemplate={sourceItemTemplate} targetItemTemplate={targetItemTemplate}
                        sourceStyle={{ height: '642px' }} targetStyle={{ height: '642px' }}
                        sourceHeader="Pendentes" targetHeader="Selecionados"
                        sourceFilterPlaceholder="Pesquisar pelo nome" targetFilterPlaceholder="Pesquisar pelo nome"
                        onChange={onChange} filterBy="reference"
                    />

                    <ConfirmFinishedOrderModal
                        displayConfirmFinishedOrderModal={displayConfirmFinishedOrderModal}
                        setDisplayConfirmFinishedOrderModal={setDisplayConfirmFinishedOrderModal}
                        onConfirm={onConfirmFinishedOrder}
                    />
                </div>
            </div>
        </>
    );
}