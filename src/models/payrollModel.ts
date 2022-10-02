import { EmployeeModel } from "./employeeModel";

interface PayrollModelProps {
    id: string;
    idEmployee: string;
    employee: EmployeeModel;
    salary: number;
    attendanceAward: number;
    productionAward: number;
    overtime: number;
    salaryToBePaid: number;
    date: Date;
}

export class PayrollModel {
    private props: PayrollModelProps;

    constructor(props: PayrollModelProps) {
        this.props = props;
    }

    get id() {
        return this.props.id;
    }

    get idEmployee() { return this.props.idEmployee; }
    set idEmployee(employeeUid: string) {
        this.props.idEmployee = employeeUid;
    }

    get employee() { return this.props.employee; }
    set employee(employee: EmployeeModel) {
        this.props.employee = employee;
    }

    get salary() { return this.props.salary; }
    set salary(salary: number) {
        this.props.salary = salary;
        this.calculateSalaryToBePaid();
    }

    get attendanceAward() { return this.props.attendanceAward; }
    set attendanceAward(attendanceAward: number) {
        this.props.attendanceAward = attendanceAward;
        this.calculateSalaryToBePaid();
    }

    get productionAward() { return this.props.productionAward; }
    set productionAward(productionAward: number) {
        this.props.productionAward = productionAward;
        this.calculateSalaryToBePaid();
    }

    get overtime() { return this.props.overtime; }
    set overtime(overtime: number) {
        this.props.overtime = overtime;
    }

    get salaryToBePaid() { return this.props.salaryToBePaid; }

    get date() { return this.props.date; }
    set date(date: Date) {
        this.props.date = date;
    }

    public calculateSalaryToBePaid() {
        this.props.salaryToBePaid = (
            this.salary +
            this.attendanceAward +
            this.productionAward
        );
    }

    static empty() {
        return new PayrollModel({
            id: "",
            idEmployee: "",
            employee: EmployeeModel.empty(),
            attendanceAward: 0,
            productionAward: 0,
            overtime: 0,
            salary: 0,
            salaryToBePaid: 0,
            date: new Date()
        });
    }

    static clone(payroll: PayrollModel) {
        return new PayrollModel({
            id: payroll.id,
            idEmployee: payroll.idEmployee,
            employee: payroll.employee,
            attendanceAward: payroll.attendanceAward,
            productionAward: payroll.productionAward,
            overtime: payroll.overtime,
            salary: payroll.salary,
            salaryToBePaid: payroll.salaryToBePaid,
            date: payroll.date
        });
    }
}