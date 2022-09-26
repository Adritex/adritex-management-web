import { PriorityType } from "../enums/PriorityType";
import { ProductModel } from "./ProductModel";

export class ProductOrderModel {
    uid: string;
    productUid: string;
    product: ProductModel;
    priority: PriorityType;
    priorityStr: string | undefined;
    order: number;

    constructor(uid: string, productUid: string, priority: PriorityType, order: number) {
        this.uid = uid;
        this.productUid = productUid;
        this.priority = priority;
        this.order = order;
        this.product = ProductModel.empty();

        if(priority == PriorityType.Low) {
            this.priorityStr = "B";
        } else if (priority == PriorityType.Medium) {
            this.priorityStr = "M";
        } else {
            this.priorityStr = "A";
        }
    }

    setProduct(product: ProductModel) {
        this.product = product;
        this.productUid = product.uid;
    }

    setPriority(priority: string) {
        this.priorityStr = priority;

        if (priority == "B") {
            this.priority = PriorityType.Low;
        } else if (priority == "M") {
            this.priority = PriorityType.Medium;
        } else {
            this.priority = PriorityType.High;
        }
    }

    static clone(productOrder: ProductOrderModel) {
        const productOrderResponse = new ProductOrderModel(
            productOrder.uid,
            productOrder.productUid,
            productOrder.priority,
            productOrder.order
        );

        if (productOrder?.product) {
            productOrderResponse.setProduct(productOrder.product);
        }

        return productOrderResponse;
    }

    static empty() {
        return new ProductOrderModel("", "", PriorityType.None, 0);
    }
}