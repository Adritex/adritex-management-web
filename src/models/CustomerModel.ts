export class CustomerModel {
    id: string;
    name: string;
    cnpj: string;
    initials: string;

    constructor(uid: string, name: string, cnpj: string, initials: string) {
        this.id = uid;
        this.name = name;
        this.cnpj = cnpj;
        this.initials = initials;
    }

    static clone(customer: CustomerModel) {
        return new CustomerModel(
            customer.id,
            customer.name,
            customer.cnpj,
            customer.initials,
        );
    }

    static empty() {
        return new CustomerModel("", "", "", "");
    }
}