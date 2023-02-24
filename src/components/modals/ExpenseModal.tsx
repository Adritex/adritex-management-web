import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Calendar } from 'primereact/calendar';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Message } from 'primereact/message';

import { classNames } from 'primereact/utils';
import { addLocale, locale } from 'primereact/api';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/authContext';
import { fetchServer } from '../../server';
import { EXPENSE_ROUTE } from '../../server/configs';
import { ExpenseModel } from '../../models/expenseModel';

export type ExpenseModalProps = {
    onSave(expense: ExpenseModel): void
    displayExpenseModal: boolean
    setDisplayExpenseModal(display: boolean): void
    action: 'Insert' | 'Update'
    setAction(action: 'Insert' | 'Update'): void
    expense: ExpenseModel | null
}

export function ExpenseModal(props: ExpenseModalProps) {
    const { userSession } = useAuth();
    const [textError, setTextError] = useState<string>('');
    const [modalText, setModalText] = useState<string>('');
    const [method, setMethod] = useState<"POST" | "GET" | "DELETE" | "PUT">('POST');
    const [url, setUrl] = useState<string>('');
    const { handleSubmit, formState: { errors }, reset, control, setValue } = useForm<ExpenseModel>({
        defaultValues: {}
    });

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

    useEffect(() => {
        if (props.action == 'Insert') {
            setUrl(EXPENSE_ROUTE);
            setMethod('POST');
            setModalText('Adicionar despesa');
            setValue('id', '');
            setValue('name', '');
            setValue('description', '');
            setValue('date', new Date());
            setValue('value', 0);
        } else {
            setMethod('PUT');
            setUrl(`${EXPENSE_ROUTE}/${props.expense?.id}`);
            setModalText('Alterar despesa');
            setValue('id', props.expense?.id || '');
            setValue('name', props.expense?.name || '');
            setValue('description', props.expense?.description || '');
            setValue('date', new Date(props.expense?.date || ''));
            setValue('value', props.expense?.value || 0);
        }
    }, [props.action]);

    async function onSubmit(expense: ExpenseModel) {
        fetchServer({
            route: url,
            method: method,
            user: userSession,
            body: JSON.stringify(expense)
        }).then(response => {
            if (response.error) {
                setTextError(response.error);
            } else {
                reset();
                setTextError('');
                props.onSave(response);
                props.setDisplayExpenseModal(false);
            }
        });
    }

    function getFormErrorMessage(property: string) {
        const error = errors[property as keyof ExpenseModel];

        if (error) {
            return <small className='p-error'>{error?.message}</small>
        }
    }

    return (
        <Dialog
            header={modalText}
            visible={props.displayExpenseModal}
            modal breakpoints={{ '960px': '75vw' }}
            style={{ width: '40vw' }}
            onHide={() => {
                reset();
                props.setAction('Insert');
                props.setDisplayExpenseModal(false);
            }}>
            {textError ? <Message severity='error' text={textError} className='w-full mb-2' /> : <></>}
            <form onSubmit={handleSubmit(onSubmit)} className="formgrid grid p-fluid">
                <Controller name="id" control={control} render={({ field, fieldState }) => (
                    <InputText id={field.name} {...field} autoFocus hidden />
                )} />
                <Controller
                    name='name'
                    control={control}
                    rules={{ required: 'Nome é obrigatório.' }}
                    render={({ field, fieldState }) => {
                        return (
                            <div className='field col-12 md:col-12'>
                                <label htmlFor={field.name} className={classNames({ 'p-error': errors.name })}>Nome*</label>
                                <InputText id={field.name} {...field} className={classNames({ 'p-invalid': fieldState.error })} />
                                {getFormErrorMessage(field.name)}
                            </div>
                        );
                    }}
                />
                <Controller
                    name='description'
                    control={control}
                    render={({ field, fieldState }) => {
                        return (
                            <div className='field col-12 md:col-12'>
                                <label htmlFor={field.name}>Descrição</label>
                                <InputText id={field.name} {...field} />
                                {getFormErrorMessage(field.name)}
                            </div>
                        );
                    }}
                />
                <Controller
                    name='value'
                    control={control}
                    rules={{ required: 'Valor é obrigatório.' }}
                    render={({ field, fieldState }) => {
                        return (
                            <div className='field col-6 md:col-6'>
                                <label htmlFor={field.name} className={classNames({ 'p-error': errors.name })}>Valor*</label>
                                <InputNumber id={field.name} className={classNames({ 'p-invalid': fieldState.error })}
                                    mode="currency" currency="BRL" value={field.value}
                                    onValueChange={(event) => {
                                        var value = Number(event.value);
                                        setValue('value', value);
                                    }} />
                                {getFormErrorMessage(field.name)}
                            </div>
                        );
                    }}
                />
                <Controller
                    name='date'
                    control={control}
                    rules={{ required: 'Data é obrigatória.' }}
                    render={({ field, fieldState }) => {
                        return (
                            <div className='field col-6 md:col-6'>
                                <label htmlFor={field.name} className={classNames({ 'p-error': errors.name })}>Data*</label>
                                <Calendar id={field.name} {...field} className={classNames({ 'p-invalid': fieldState.error })} showIcon dateFormat="dd/mm/yy" />
                                {getFormErrorMessage(field.name)}
                            </div>
                        );
                    }}
                />

                <div className="field col-12 flex justify-content-end gap-3">
                    <Button
                        type="button"
                        icon="pi pi-times"
                        label="Cancelar"
                        className="p-button-text"
                        onClick={() => {
                            reset();
                            props.setDisplayExpenseModal(false);
                        }} />
                    <Button
                        type="submit"
                        icon="pi pi-check"
                        label="Salvar"
                    />
                </div>
            </form>
        </Dialog>
    );
}