import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Calendar } from 'primereact/calendar';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { useState } from "react";
import { addLocale, locale } from 'primereact/api';
import { classNames } from 'primereact/utils';
import { ExpenseModel } from "../../models/expenseModel";
import {
    Controller,
    Control,
    FieldErrorsImpl,
    DeepRequired,
    UseFormHandleSubmit,
    UseFormReset,
    UseFormSetValue
} from 'react-hook-form';
import { EXPENSE_ROUTE } from "../../server/configs";

type ExpenseModalProps = {
    expenseModalText: string,
    displayExpenseModal: boolean,
    setDisplayExpenseModal: (display: boolean) => void,
    expense: ExpenseModel,
    setExpense: (expense: ExpenseModel) => void,
    onClickSave: (expense: ExpenseModel) => void,
    control: Control<ExpenseModel, object>,
    errors: FieldErrorsImpl<DeepRequired<ExpenseModel>>,
    handleSubmit: UseFormHandleSubmit<ExpenseModel>,
    reset: UseFormReset<ExpenseModel>,
    setValue: UseFormSetValue<ExpenseModel>
};

export function ExpenseModal(props: ExpenseModalProps) {
    const [formData, setFormData] = useState({});
    const [value, setValue] = useState<number>(0);
    const [date, setDate] = useState<any>(props.expense.date);

    addLocale('pt', {
        firstDayOfWeek: 1,
        dayNames: ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"],
        dayNamesShort: ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"],
        dayNamesMin: ["Do", "Se", "Te", "Qa", "Qi", "Sx", "Sa"],
        monthNames: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"],
        monthNamesShort: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"],
        today: "Hoje",
        clear: 'Limpar'
    });

    locale('pt');

    function onSubmit(data: ExpenseModel) {
        setFormData(data);
        data.date = date;
        data.value = value;

        let route: string = EXPENSE_ROUTE;
        route += data.id ? `/${data.id}` : "";

        fetch(route, {
            method: "POST",
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' },
        }).then(response => {
            return response.json();
        }).then((response: ExpenseModel) => {
            props.reset();
            props.onClickSave(response);
            props.setDisplayExpenseModal(false);
            setDate(null);
            setValue(0);
        })
    }

    function getFormErrorMessage(propertyName: string) {
        const property = props.errors[propertyName as keyof ExpenseModel];

        if (property) {
            return (
                <small className="p-error">
                    {property.message}
                </small>
            );
        }
    }

    return (
        <Dialog
            header={props.expenseModalText}
            visible={props.displayExpenseModal}
            modal
            breakpoints={{ '960px': '75vw' }}
            style={{ width: '40vw' }}
            onShow={() => {
                props.setExpense(ExpenseModel.empty());
                setDate(new Date(props.expense.date));
                setValue(props.expense.value);
            }}
            onHide={() => {
                props.reset();
                setDate(null);
                setValue(0);
                props.setDisplayExpenseModal(false);
            }}>
            <div className="pt-4">
                <form onSubmit={props.handleSubmit(onSubmit)} className="formgrid grid p-fluid">
                    <Controller name="id" control={props.control} render={({ field, fieldState }) => (
                        <InputText
                            id={field.name} {...field} autoFocus hidden
                        />
                    )} />
                    <div className="field col-12 md:col-12">
                        <label htmlFor="name" className={classNames({ 'p-error': props.errors.name })}>Nome*</label>
                        <Controller name="name" control={props.control} rules={{ required: 'Nome da despesa é obrigatório.' }} render={({ field, fieldState }) => (
                            <InputText
                                id={field.name} {...field} autoFocus
                                className={classNames({ 'p-invalid': fieldState.invalid })}
                            />
                        )} />
                        {getFormErrorMessage('name')}
                    </div>
                    <div className="field col-12 md:col-12">
                        <label htmlFor="description">Descição</label>
                        <Controller name="description" control={props.control} render={({ field, fieldState }) => (
                            <InputText
                                id={field.name} {...field} autoFocus
                            />
                        )} />
                    </div>
                    <div className="field col-6 md:col-6">
                        <label htmlFor="value" className={classNames({ 'p-error': props.errors.value })}>Valor</label>
                        <Controller name="value" control={props.control} rules={{ required: 'Valor da despesa é obrigatório.' }} render={({ field, fieldState }) => (
                            <InputNumber
                                id={field.name}
                                autoFocus
                                value={value}
                                className={classNames({ 'p-invalid': fieldState.invalid })}
                                min={0}
                                mode="currency" currency="BRL"
                                onValueChange={(event) => {
                                    var value = Number(event.value);
                                    setValue(value);
                                    props.setValue("value", value);
                                }}
                            />
                        )} />
                        {getFormErrorMessage('value')}
                    </div>
                    <div className="field col-6 md:col-6">
                        <label htmlFor="date">Data</label>
                        <Calendar
                            id={"date"} showIcon dateFormat="dd/mm/yy"
                            value={date} onChange={(e) => setDate(e.value)}
                        />
                    </div>

                    <div className="field col-12 flex justify-content-end gap-3">
                        <Button
                            type="button"
                            icon="pi pi-times"
                            label="Cancelar"
                            className="p-button-text"
                            onClick={() => {
                                props.reset();
                                props.setDisplayExpenseModal(false);
                            }} />
                        <Button
                            type="submit"
                            icon="pi pi-check"
                            label="Salvar"
                        />
                    </div>
                </form>
            </div>
        </Dialog>
    );
}