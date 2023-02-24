interface ExpenseProps {
    id: string;
    name: string;
    description: string;
    value: number;
    date: Date;
}

export class ExpenseModel {
    private props: ExpenseProps;

    constructor(props: ExpenseProps) {
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

    get description() {
        return this.props.description;
    }

    set description(description: string) {
        this.props.description = description;
    }

    get value(): number {
        return this.props.value;
    }

    set value(value: number) {
        this.props.value = value;
    }

    get date() {
        return this.props.date;
    }

    set date(date: Date) {
        this.props.date = date;
    }

    static empty() {
        return new ExpenseModel({
            id: "",
            name: "",
            description: "",
            date: new Date(),
            value: 0
        });
    }

    static clone(expense: ExpenseModel) {
        return new ExpenseModel({
            id: expense.id,
            name: expense.name,
            description: expense.description,
            value: expense.value,
            date: expense.date
        });
    }
}