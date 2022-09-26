import { EmployeeModel } from "./EmployeeModel";

export class PayrollModel {
    uid: string;
    employeeUid: string;
    employee: EmployeeModel | undefined;
    salary: number;
    attendanceAward: number;
    productionAward: number;
    overtime: number;
    salaryToBePaid: number | undefined;
    date: string;

    constructor(uid: string, employeeUid: string,
        salary: number, attendanceAward: number,
        productionAward: number, overtime: number, date: string) {
        this.uid = uid;
        this.employeeUid = employeeUid;
        this.salary = salary;
        this.attendanceAward = attendanceAward;
        this.productionAward = productionAward;
        this.overtime = overtime;
        this.date = date;
        this.calculateSalaryToBePaid();
    }

    setSalary(salary: number) {
        this.salary = salary;
        this.calculateSalaryToBePaid();
    }

    setAttendanceAward(attendanceAward: number) {
        this.attendanceAward = attendanceAward;
        this.calculateSalaryToBePaid();
    }

    setProductionAward(productionAward: number) {
        this.productionAward = productionAward;
        this.calculateSalaryToBePaid();
    }

    setEmployee(employee: EmployeeModel) {
        this.employee = employee;
    }

    private calculateSalaryToBePaid() {
        this.salaryToBePaid = (
            this.salary +
            this.attendanceAward +
            this.productionAward
        );
    }

    static clone(payroll: PayrollModel) {
        return new PayrollModel(
            payroll.uid,
            payroll.employeeUid,
            payroll.salary,
            payroll.attendanceAward,
            payroll.productionAward,
            payroll.overtime,
            payroll.date
        );
    }

    static empty() {
        return new PayrollModel("", "", 0, 0, 0, 0, "");
    }
}