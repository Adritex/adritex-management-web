export class ExpenseModel {
    uid: string;
    name: string;
    description: string;
    value: number;
    date: string;

    constructor(uid: string, name: string, description: string, value: number, date: string) {
        this.uid = uid;
        this.name = name;
        this.description = description;
        this.value = value;
        this.date = date;
    }

    static clone(expense: ExpenseModel) {
        return new ExpenseModel(
            expense.uid,
            expense.name,
            expense.description,
            expense.value,
            expense.date,
        );
    }

    static empty() {
        return new ExpenseModel("", "", "", 0, "");
    }
}