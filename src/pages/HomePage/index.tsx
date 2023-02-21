import { useEffect, useState, useContext } from "react";
import { ProductModel } from "../../models/productModel";
import { ProductOrderModel } from "../../models/productOrderModel";
import { StatusType } from "../../enums/statusType";
import { PRODUCT_ORDERS_ROUTE, ORDERS_ROUTE, GOAL_ROUTE, CUSTOMER_ROUTE } from "../../server/configs";

import { DataView } from 'primereact/dataview';
import { Image } from "primereact/image";
import { ProgressBar } from 'primereact/progressbar';
import { Divider } from "primereact/divider";
import { PriorityType } from "../../enums/priorityType";
import { useAuth } from "../../contexts/authContext";
import { fetchServer } from "../../server";
import { Button } from "primereact/button";
import { GoalModal } from "../../components/modals/GoalModal";
import { GoalModel } from "../../models/goalModel";
import { CustomerModel } from "../../models/customerModel";

function HomePage() {
    const { userSession } = useAuth();
    const [goal, setGoal] = useState<GoalModel>(GoalModel.empty());
    const [progressbar, setProgressbar] = useState<number>(0);
    const [lowOrder, setLowOrder] = useState<ProductOrderModel[]>([]);
    const [displayGoalModal, setDisplayGoalModal] = useState<boolean>(false);
    const [mediumOrder, setMediumOrder] = useState<ProductOrderModel[]>([]);
    const [highOrder, setHighOrder] = useState<ProductOrderModel[]>([]);
    const [customers, setCustomers] = useState<CustomerModel[]>([]);

    useEffect(() => {
        getValuesFromServer();
        setInterval(getValuesFromServer, 60000);
    }, []);

    function getValuesFromServer() {
        fetchServer({
            route: GOAL_ROUTE,
            method: "GET",
            user: userSession
        }).then((response: GoalModel) => {
            setGoal(response);
            setProgressbar(getProgress(response));
        });

        fetchServer({
            route: CUSTOMER_ROUTE,
            method: "GET",
            user: userSession
        }).then((customers: CustomerModel[]) => {
            setCustomers(customers);

            fetchServer({
                route: PRODUCT_ORDERS_ROUTE,
                method: "GET",
                user: userSession
            }).then((products: ProductModel[]) => {
                fetchServer({
                    route: ORDERS_ROUTE,
                    method: "GET",
                    user: userSession
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

                                const customer = customers.find(item => item.id == product.idCustomer);

                                if (customer) {
                                    productOrder.product.customer = customer;
                                }
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
        });
    }

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

    function getProgress(goal: GoalModel) {
        const value = ((goal.currentQuantity * 100) / goal.expectedQuantity);
        return Math.round(value);
    }

    return (
        <div className="h-screen w-full mt-3">
            <div className="card">
                <div className="flex align-items-center justify-content-between">
                    <h5>Meta de produção</h5>
                    {userSession?.accessType == 0 ? (
                        <Button
                            label="Definir metas"
                            onClick={() => {
                                setDisplayGoalModal(true);
                            }}
                        />
                    ) : (<></>)}
                </div>
                <ProgressBar value={progressbar}></ProgressBar>
                <div className="flex align-items-center justify-content-between">
                    <h6 className="m-0 p-0">Peças produzidas: {goal.currentQuantity ?? 0}</h6>
                    <h6 className="m-0 p-0">Meta de peças: {goal.expectedQuantity ?? 0}</h6>
                </div>
            </div>
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

            <GoalModal
                displayGoalModal={displayGoalModal}
                setDisplayGoalModal={setDisplayGoalModal}
                goal={goal}
                onClickSaveGoal={(goal) => {
                    fetchServer({
                        route: GOAL_ROUTE,
                        method: "POST",
                        user: userSession,
                        body: JSON.stringify({
                            currentQuantity: goal.currentQuantity,
                            expectedQuantity: goal.expectedQuantity
                        })
                    }).then((response: GoalModel) => {
                        setGoal(response);
                        setProgressbar(getProgress(response));
                    })
                }}
            />
        </div>
    )
}

export default HomePage;