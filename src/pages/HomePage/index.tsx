import { useEffect, useState, useContext } from "react";
import { ProductModel } from "../../models/productModel";
import { ProductOrderModel } from "../../models/productOrderModel";
import { StatusType } from "../../enums/statusType";
import { PRODUCT_ORDERS_ROUTE, ORDERS_ROUTE } from "../../server/configs";

import { DataView } from 'primereact/dataview';
import { Image } from "primereact/image";
import { Divider } from "primereact/divider";
import { PriorityType } from "../../enums/priorityType";
import { AuthContext } from "../../contexts/authContext";
import { fetchServer } from "../../server";

function HomePage() {
    const { user } = useContext(AuthContext);
    const [lowOrder, setLowOrder] = useState<ProductOrderModel[]>([]);
    const [mediumOrder, setMediumOrder] = useState<ProductOrderModel[]>([]);
    const [highOrder, setHighOrder] = useState<ProductOrderModel[]>([]);

    useEffect(() => {
        fetchServer({
            route: PRODUCT_ORDERS_ROUTE,
            method: "GET",
            user: user
        }).then((products: ProductModel[]) => {
            fetchServer({
                route: ORDERS_ROUTE,
                method: "GET",
                user: user
            }).then((productOrders: ProductOrderModel[]) => {
                const low: ProductOrderModel[] = [];
                const medium: ProductOrderModel[] = [];
                const high: ProductOrderModel[] = [];

                productOrders
                    .sort((a, b) => a.order > b.order ? 1 : -1)
                    .forEach(productOrderItem => {
                        const productOrder = ProductOrderModel.clone(productOrderItem);
                        const product = products.find(item => item.id == productOrderItem.idProduct);

                        if (product) {
                            productOrder.product = product;
                        }

                        if (productOrder.priority == PriorityType.Low) {
                            low.push(productOrder);
                        } else if (productOrder.priority == PriorityType.Medium) {
                            medium.push(productOrder);
                        } else {
                            high.push(productOrder);
                        }
                    });

                setLowOrder(low);
                setMediumOrder(medium);
                setHighOrder(high);
            });
        });
    }, []);

    const renderListItem = (data: ProductOrderModel) => {
        return (
            <div className="col-12 border-bottom-1 border-200">
                <div className="product-list-item">
                    <Image
                        src={data.product.image?.toString()}
                        alt={data.product.description}
                    />
                    <div className="product-list-detail">
                        <b>{data.product.description.toUpperCase()}</b>
                        <br />
                        <br />
                        <span><b>OF: </b>{data.product.of}</span>
                        <br />
                        <span><b>Referência: </b>{data.product.reference}</span>
                        <br />
                        <span><b>Quantidade: </b>{data.product.quantity}</span>
                        <br />
                        <span><b>Cliente: </b>{data.product.customer?.name}</span>
                        <br />
                    </div>
                    <div className="product-list-action">
                        <span className="product-price">Ordem: {data.order}</span>
                    </div>
                </div>
            </div>
        );
    }

    function statusBodyTemplate(rowData: ProductModel) {
        if (rowData.status == StatusType.None || rowData.status == StatusType.Pending) {
            return <span className={`customer-badge status-proposal text-center`}>Pendente</span>
        } else if (rowData.status == StatusType.Progress) {
            return <span className={`customer-badge status-new text-center`}>Em andamento</span>
        } else if (rowData.status == StatusType.Finished) {
            return <span className={`customer-badge status-qualified text-center`}>Finalizado</span>
        } else if (rowData.status == StatusType.Canceled) {
            return <span className={`customer-badge status-unqualified text-center`}>Cancelado</span>
        }
    }

    return (
        <div className="h-screen w-full mt-3">
            <div className="grid h-full px-2">
                <div className="col flex flex-column">
                    <div className="flex align-items-center justify-content-center">
                        <h4 className="bg-green-400 px-3 py-1 border-round-md">Baixo</h4>
                    </div>

                    <div className="dataview-demo">
                        <div className="card">
                            <DataView
                                value={lowOrder} layout={"grid"}
                                itemTemplate={renderListItem}
                                emptyMessage="Não existe nenhuma ordem com prioridade baixa cadastrada."
                            />
                        </div>
                    </div>
                </div>

                <Divider layout="vertical" />
                <div className="col flex flex-column">
                    <div className="flex align-items-center justify-content-center">
                        <h4 className="bg-yellow-400 px-3 py-1 border-round-md">Médio</h4>
                    </div>

                    <div className="dataview-demo">
                        <div className="card">
                            <DataView
                                value={mediumOrder} layout={"grid"}
                                itemTemplate={renderListItem}
                                emptyMessage="Não existe nenhuma ordem com prioridade média cadastrada."
                            />
                        </div>
                    </div>
                </div>

                <Divider layout="vertical" />
                <div className="col flex flex-column">
                    <div className="flex align-items-center justify-content-center">
                        <h4 className="bg-orange-400 px-3 py-1 border-round-md">Alto</h4>
                    </div>

                    <div className="dataview-demo">
                        <div className="card">
                            <DataView
                                value={highOrder} layout={"grid"}
                                itemTemplate={renderListItem}
                                emptyMessage="Não existe nenhuma ordem com prioridade alta cadastrada."
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HomePage;