import { StatusType } from "../enums/StatusType";
import { CustomerModel } from "./CustomerModel";

export class ProductModel {
    uid: string;
    customer: CustomerModel | undefined;
    customerUid: string;
    reference: string;
    of: string;
    description: string;
    quantity: number;
    unitaryValue: number;
    amount: number | undefined;
    status: StatusType;
    image: string | ArrayBuffer | undefined | null;
    date: string;

    constructor(
        uid: string, customerUid: string,
        reference: string, of: string,
        description: string, quantity: number,
        unitaryValue: number, date: string, status: StatusType
    ) {
        this.uid = uid;
        this.customerUid = customerUid;
        this.reference = reference;
        this.of = of;
        this.description = description;
        this.quantity = quantity;
        this.unitaryValue = unitaryValue;
        this.status = status;
        this.date = date;

        this.calculateTotalAmount();
    }

    setImage(image: string | ArrayBuffer | undefined | null){
        this.image = image;
    }

    setCustomer(customer: CustomerModel) {
        this.customer = customer;
        this.customerUid = customer.uid;
    }

    setQuantity(quantity: number) {
        this.quantity = quantity;
        this.calculateTotalAmount();
    }

    setUnitaryValue(unitaryValue: number) {
        this.unitaryValue = unitaryValue;
        this.calculateTotalAmount();
    }

    private calculateTotalAmount() {
        this.amount = (Number(this.quantity) * Number(this.unitaryValue));
    }

    static clone(product: ProductModel) {
        const clone = new ProductModel(
            product.uid,
            product.customerUid,
            product.reference,
            product.of,
            product.description,
            product.quantity,
            product.unitaryValue,
            product.date,
            product.status
        );

        clone.setImage(product?.image ?? "");

        return clone;
    }

    static empty() {
        return new ProductModel("", "", "", "", "", 0, 0, "", StatusType.None);
    }
}