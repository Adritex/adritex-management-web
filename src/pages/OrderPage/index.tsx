import { useContext, useEffect, useRef, useState } from "react";
import { StatusType } from "../../enums/statusType";
import { PriorityType } from "../../enums/priorityType";
import { ProductModel } from "../../models/productModel";
import { ProductOrderModel } from "../../models/productOrderModel";
import { ORDERS_ROUTE, PRODUCT_ORDERS_ROUTE } from "../../server/configs";
import { fetchServer } from "../../server";
import { AuthContext } from "../../contexts/authContext";

import { PickList, PickListChangeParams } from 'primereact/picklist';
import { SelectButton } from 'primereact/selectbutton';
import { Image } from 'primereact/image';
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { ConfirmFinishedOrderModal } from "../../components/modals/ConfirmFinishedOrderModal";

function OrderPage() {
    const toast = useRef<any>(null);
    const { user } = useContext(AuthContext);
    const [source, setSource] = useState<ProductModel[]>([]);
    const [target, setTarget] = useState<ProductModel[]>([]);
    const [productOrders, setProductOrders] = useState<ProductOrderModel[]>([]);
    const [displayConfirmFinishedOrderModal, setDisplayConfirmFinishedOrderModal] = useState<boolean>(false);
    const [selectedProductOrder, setSelectedProductOrder] = useState<ProductOrderModel>(ProductOrderModel.empty());
    const priorityOptions = ["B", "M", "A"];

    useEffect(() => {
        fetchServer({
            route: PRODUCT_ORDERS_ROUTE,
            method: "GET",
            user: user,
        }).then((products: any[]) => {
            fetchServer({
                route: ORDERS_ROUTE,
                method: "GET",
                user: user,
            }).then((productOrders: any[]) => {
                const targetProducts: ProductModel[] = [];
                const targetProductOrders: ProductOrderModel[] = [];

                productOrders.forEach((productOrderItem: any) => {
                    const productOrder = ProductOrderModel.clone(productOrderItem);
                    const product = products.find(item => item.id == productOrder.idProduct);

                    if (product) {
                        productOrder.product = product;
                        targetProducts.push(product);
                    }

                    products = products.filter(item => item.id != productOrder.idProduct);

                    targetProductOrders.push(productOrder);
                });

                setSource(products);
                setTarget(targetProducts);
                setProductOrders(targetProductOrders);
            });
        });
    }, []);

    function onChange(event: PickListChangeParams) {
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
            const productOrder = new ProductOrderModel({
                id: "",
                priority: PriorityType.Low,
                order: index,
                idProduct: product.id,
                product: ProductModel.empty(),
            });

            productOrder.product = product;

            return productOrder;
        }));
    }

    function sourceItemTemplate(item: ProductModel) {
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
                            const productOrder = productOrders.find(productOrder => productOrder.idProduct == item.id);
                            if (productOrder) {
                                setSelectedProductOrder(productOrder);
                            }
                            setDisplayConfirmFinishedOrderModal(true);
                        }}
                    />
                    <h6 className="mb-2">{formatCurrency(item.amount)}</h6>
                    {getStatus(item)}
                    <SelectButton
                        value={getPriorityStr(item)}
                        className="mt-3"
                        options={priorityOptions}
                        itemTemplate={justifyTemplate}
                        onChange={(event) => {
                            const productOrder = productOrders.find(productOrder => productOrder.idProduct == item.id);
                            if (productOrder) {
                                productOrder.priority = getPriority(event.value);
                            }
                        }}
                    />
                </div>
            </div>
        );
    }

    function getPriorityStr(item: ProductModel) {
        const product = productOrders.find(productOrder => productOrder.idProduct == item.id);

        if (product?.priority == PriorityType.Low) {
            return "B";
        } else if (product?.priority == PriorityType.Medium) {
            return "M";
        } else if (product?.priority == PriorityType.High) {
            return "A";
        }
    }

    function getPriority(item: string) {
        if (item == "B") {
            return PriorityType.Low;
        } else if (item == "M") {
            return PriorityType.Medium;
        } else if (item == "A") {
            return PriorityType.High;
        }

        return PriorityType.None;
    }

    const justifyTemplate = (option: string) => {
        return <small>{option}</small>;
    }

    const formatCurrency = (value: number) => {
        return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    const getStatus = (item: any) => {
        if (item.status == StatusType.None || item.status == StatusType.Pending) {
            return <span className={`customer-badge status-proposal`}>Pendente</span>
        } else if (item.status == StatusType.Progress) {
            return <span className={`customer-badge status-new`}>Em andamento</span>
        }
    }

    function onConfirmFinishedOrder(date: string) {
        fetchServer({
            route: `${ORDERS_ROUTE}/${selectedProductOrder.id}/finish`,
            method: "POST",
            user: user,
            body: JSON.stringify({ date: date })
        }).then((response) => {
            const productOrder: ProductOrderModel = response;
            const filteredTarget = target.filter(item => item.id != productOrder.idProduct);
            setTarget(filteredTarget);

            toast.current.show({
                severity: 'success',
                summary: 'Sucesso!',
                detail: 'Ordem de produção finalizada com sucesso!',
                life: 3000
            });
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
                                fetchServer({
                                    route: ORDERS_ROUTE,
                                    method: "POST",
                                    user: user,
                                    body: JSON.stringify({ orders: productOrders })
                                }).then(() => {
                                    toast.current.show({
                                        severity: 'success',
                                        summary: 'Sucesso!',
                                        detail: 'Ordem de produção alterada!',
                                        life: 3000
                                    });
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
    )
}

export default OrderPage;