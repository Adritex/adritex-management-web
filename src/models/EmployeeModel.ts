export class EmployeeModel {
    uid: string;
    name: string;
    cpf: string;
    birthDate: string;
    active: boolean;

    constructor(uid: string, name: string, cpf: string, birthDate: string, active: boolean) {
        this.uid = uid;
        this.name = name;
        this.cpf = cpf;
        this.birthDate = birthDate;
        this.active = active;
    }

    static clone(employee: EmployeeModel) {
        return new EmployeeModel(
            employee.uid,
            employee.name,
            employee.cpf,
            employee.birthDate,
            employee.active,
        );
    }

    static empty() {
        return new EmployeeModel("", "", "", "", true);
    }
}