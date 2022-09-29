interface CustomerProps {
    id: string;
    name: string;
    cnpj: string;
    initials: string;
}

export class CustomerModel {
    private props: CustomerProps;

    constructor(props: CustomerProps) {
        this.props = props;
    }

    get id() {
        return this.props.id;
    }

    get name() {
        return this.props.name;
    }

    set name(name: string) {
        this.props.name = name;
    }

    get cnpj() {
        return this.props.cnpj;
    }

    set cnpj(cnpj: string) {
        this.props.cnpj = cnpj;
    }

    get initials() {
        return this.props.initials;
    }

    set initials(initials: string) {
        this.props.initials = initials;
    }

    static empty() {
        return new CustomerModel({
            id: "",
            cnpj: "",
            initials: "",
            name: "",
        });
    }

    static clone(customer: CustomerModel) {
        return new CustomerModel({
            id: customer.id,
            cnpj: customer.cnpj,
            initials: customer.initials,
            name: customer.name
        });
    }
}