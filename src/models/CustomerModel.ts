export class CustomerModel {
    uid: string;
    name: string;
    cnpj: string;
    initials: string;

    constructor(uid: string, name: string, cnpj: string, initials: string) {
        this.uid = uid;
        this.name = name;
        this.cnpj = cnpj;
        this.initials = initials;
    }

    static clone(customer: CustomerModel) {
        return new CustomerModel(
            customer.uid,
            customer.name,
            customer.cnpj,
            customer.initials,
        );
    }

    static empty() {
        return new CustomerModel("", "", "", "");
    }
}