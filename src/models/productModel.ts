import { StatusType } from "../enums/statusType";
import { CustomerModel } from "./customerModel";

interface ProductProps {
    id: string;
    customer: CustomerModel;
    idCustomer: string;
    reference: string;
    of: string;
    description: string;
    quantity: number;
    unitaryValue: number;
    amount: number;
    status: StatusType;
    image: string | ArrayBuffer;
    date: Date | undefined;
}

export class ProductModel {
    private props: ProductProps;

    constructor(props: ProductProps) {
        this.props = props;
    }

    get id() { return this.props.id; }
    get customer() { return this.props.customer; }
    get idCustomer() { return this.props.idCustomer; }
    get reference() { return this.props.reference; }
    get of() { return this.props.of; }
    get description() { return this.props.description; }
    get quantity() { return this.props.quantity; }
    get unitaryValue() { return this.props.unitaryValue; }
    get amount() { return this.props.amount; }
    get status() { return this.props.status; }
    get image() { return this.props.image; }
    get date() { return this.props.date; }

    set customer(customer: CustomerModel) { this.props.customer = customer; }
    set idCustomer(idCustomer: string) { this.props.idCustomer = idCustomer; }
    set reference(reference: string) { this.props.reference = reference; }
    set of(of: string) { this.props.of = of; }
    set description(description: string) { this.props.description = description; }
    set quantity(quantity: number) { this.props.quantity = quantity; }
    set unitaryValue(unitaryValue: number) { this.props.unitaryValue = unitaryValue; }
    set amount(amount: number) { this.props.amount = amount; }
    set status(status: StatusType) { this.props.status = status; }
    set image(image: string | ArrayBuffer) { this.props.image = image; }
    set date(date: Date | undefined) { this.props.date = date; }
 
    static empty() {
        return new ProductModel({
            id: "",
            customer: CustomerModel.empty(),
            idCustomer: "",
            reference: "",
            of: "",
            description: "",
            quantity: 0,
            unitaryValue: 0,
            amount: 0,
            status: StatusType.Pending,
            image: "",
            date: undefined,
        });
    }

    static clone(product: ProductModel) {
        return new ProductModel({
            id: product.id,
            customer: product.customer,
            idCustomer: product.idCustomer,
            reference: product.reference,
            of: product.of,
            description: product.description,
            quantity: product.quantity,
            unitaryValue: product.unitaryValue,
            amount: product.amount,
            status: product.status,
            image: product.image,
            date: product.date,
        });
    }
}