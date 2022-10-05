import { PriorityType } from "../enums/priorityType";
import { ProductModel } from "./productModel";

interface ProductOrderProps {
    id: string;
    idProduct: string;
    product: ProductModel;
    priority: PriorityType;
    order: number;
}

export class ProductOrderModel {
    private props: ProductOrderProps;

    constructor(props: ProductOrderProps) {
        this.props = props;
    }

    get id() { return this.props.id; }
    get idProduct() { return this.props.idProduct; }
    get product() { return this.props.product; }
    get priority() { return this.props.priority; }
    get order() { return this.props.order; }

    set idProduct(idProduct: string) { this.props.idProduct = idProduct; }
    set product(product: ProductModel) { this.props.product = product; }
    set priority(priority: PriorityType) { this.props.priority = priority; }
    set order(order: number) { this.props.order = order; }

    static empty() {
        return new ProductOrderModel({
            id: "",
            idProduct: "",
            product: ProductModel.empty(),
            order: 0,
            priority: PriorityType.None,
        });
    }

    static clone(productOrder: ProductOrderModel) {
        return new ProductOrderModel({
            id: productOrder.id,
            idProduct: productOrder.idProduct,
            product: productOrder.product,
            priority: productOrder.priority,
            order: productOrder.order,
        });
    }
}