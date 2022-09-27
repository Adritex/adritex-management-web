export class EmployeeModel {
    id: string;
    name: string;
    cpf: string;
    birthDate: string;
    active: boolean;

    constructor(id: string, name: string, cpf: string, birthDate: string, active: boolean) {
        this.id = id;
        this.name = name;
        this.cpf = cpf;
        this.birthDate = birthDate;
        this.active = active;
    }

    static clone(employee: EmployeeModel) {
        return new EmployeeModel(
            employee.id,
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