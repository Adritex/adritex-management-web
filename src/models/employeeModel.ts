interface EmployeeProps {
    id: string;
    name: string;
    cpf: string;
    birthDate: Date;
    active: boolean;
}

export class EmployeeModel {
    private props: EmployeeProps;

    constructor(props: EmployeeProps) {
        this.props = props;
    }

    get id(): string {
        return this.props.id;
    }

    get name(): string {
        return this.props.name;
    }

    set name(name: string) {
        this.props.name = name;
    }

    get cpf(): string {
        return this.props.cpf;
    }

    set cpf(cpf: string) {
        this.props.cpf = cpf;
    }

    get birthDate() {
        return this.props.birthDate;
    }

    set birthDate(birthDate: Date) {
        this.props.birthDate = birthDate;
    }

    get active(): boolean {
        return this.props.active;
    }

    set active(active: boolean) {
        this.props.active = active;
    }

    static empty() {
        return new EmployeeModel({
            id: "",
            name: "",
            active: true,
            birthDate: new Date(),
            cpf: ""
        });
    }

    static clone(emplyoee: EmployeeModel) {
        return new EmployeeModel({
            id: emplyoee.id,
            name: emplyoee.name,
            active: emplyoee.active,
            birthDate: emplyoee.birthDate,
            cpf: emplyoee.cpf,
        });
    }
}