export class ExpenseModel {
    id: string;
    name: string;
    description: string;
    value: number;
    date: string;

    constructor(id: string, name: string, description: string, value: number, date: string) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.value = value;
        this.date = date;
    }

    static clone(expense: ExpenseModel) {
        return new ExpenseModel(
            expense.id,
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