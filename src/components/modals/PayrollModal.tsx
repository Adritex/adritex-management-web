import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Message } from 'primereact/message';

import { classNames } from 'primereact/utils';
import { addLocale, locale } from 'primereact/api';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/authContext';
import { PAYROLLS_ROUTE } from '../../server/configs';
import { fetchServer } from '../../server';
import { PayrollModel } from '../../models/payrollModel';
import { EmployeeModel } from '../../models/employeeModel';

export type PayrollModalProps = {
    onSave(payroll: PayrollModel): void
    displayPayrollModal: boolean
    setDisplayPayrollModal(display: boolean): void
    action: 'Insert' | 'Update'
    setAction(action: 'Insert' | 'Update'): void
    payroll: PayrollModel | null
    employees: EmployeeModel[]
}

export function PayrollModal(props: PayrollModalProps) {
    const { userSession } = useAuth();
    const [textError, setTextError] = useState<string>('');
    const [modalText, setModalText] = useState<string>('');
    const [employeeOptions, setEmployeeOptions] = useState<any[]>([]);
    const [method, setMethod] = useState<"POST" | "GET" | "DELETE" | "PUT">('POST');
    const [url, setUrl] = useState<string>('');
    const { handleSubmit, formState: { errors }, reset, control, setValue, getValues } = useForm<PayrollModel>({
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
        setEmployeeOptions(props.employees.map(employee => {
            return {
                label: employee.name,
                value: employee.id
            }
        }));

        if (props.action == 'Insert') {
            setUrl(PAYROLLS_ROUTE);
            setMethod('POST');
            setModalText('Adicionar folha de pagamento');
            setValue('id', '');
            setValue('employee', null);
            setValue('idEmployee', '');
            setValue('attendanceAward', 0);
            setValue('productionAward', 0);
            setValue('overtime', 0);
            setValue('date', new Date());
            setValue('salary', 0);
            setValue('salaryToBePaid', 0);
        } else {
            setMethod('PUT');
            setUrl(`${PAYROLLS_ROUTE}/${props.payroll?.id}`);
            setModalText('Alterar folha de pagamento');
            setValue('id', props.payroll?.id || '');
            setValue('employee', props.payroll?.employee || null);
            setValue('idEmployee', props.payroll?.idEmployee || '');
            setValue('attendanceAward', Number(props.payroll?.attendanceAward) || 0);
            setValue('productionAward', Number(props.payroll?.productionAward) || 0);
            setValue('overtime', Number(props.payroll?.overtime) || 0);
            setValue('date', new Date(props.payroll?.date || ''));
            setValue('salary', Number(props.payroll?.salary) || 0);
            setValue('salaryToBePaid', Number(props.payroll?.salaryToBePaid) || 0);
        }
    }, [props.displayPayrollModal]);

    async function onSubmit(payroll: PayrollModel) {
        fetchServer({
            route: url,
            method: method,
            user: userSession,
            body: JSON.stringify(payroll)
        }).then(response => {
            if (response.error) {
                setTextError(response.error);
            } else {
                reset();
                setTextError('');
                props.onSave(response);
                props.setDisplayPayrollModal(false);
            }
        });
    }

    function getFormErrorMessage(property: string) {
        const error = errors[property as keyof PayrollModel];

        if (error) {
            return <small className='p-error'>{error?.message}</small>
        }
    }

    return (
        <Dialog
            header={modalText}
            visible={props.displayPayrollModal}
            modal breakpoints={{ '960px': '75vw' }}
            style={{ width: '40vw' }}
            onHide={() => {
                reset();
                props.setAction('Insert');
                props.setDisplayPayrollModal(false);
            }}>
            {textError ? <Message severity='error' text={textError} className='w-full mb-2' /> : <></>}
            <form onSubmit={handleSubmit(onSubmit)} className="formgrid grid p-fluid">
                <Controller name="id" control={control} render={({ field, fieldState }) => (
                    <InputText id={field.name} {...field} autoFocus hidden />
                )} />
                <Controller
                    name='idEmployee'
                    control={control}
                    rules={{ required: 'Funcionário é obrigatório.' }}
                    render={({ field, fieldState }) => {
                        return (
                            <div className='field col-12 md:col-12'>
                                <label htmlFor={field.name} className={classNames({ 'p-error': errors.idEmployee })}>Funcionário*</label>
                                <Dropdown id={field.name} {...field} className={classNames({ 'p-invalid': fieldState.error })}
                                    options={employeeOptions}
                                    filter
                                    emptyMessage="Nenhum funcionário encontrado"
                                    emptyFilterMessage="Nenhum funcionário encontrado"
                                    placeholder="Selecione o funcionário"
                                    onChange={(event) => {
                                        setValue("idEmployee", event.value);
                                    }} />
                                {getFormErrorMessage(field.name)}
                            </div>
                        );
                    }}
                />
                <Controller
                    name='salary'
                    control={control}
                    rules={{ required: 'Salário é obrigatório.' }}
                    render={({ field, fieldState }) => {
                        return (
                            <div className='field col-4 md:col-4'>
                                <label htmlFor={field.name} className={classNames({ 'p-error': errors.salary })}>Salário*</label>
                                <InputNumber id={field.name} className={classNames({ 'p-invalid': fieldState.error })}
                                    mode="currency" currency="BRL" value={field.value}
                                    onValueChange={(event) => {
                                        const value = Number(event.value);
                                        setValue('salary', value);
                                        setValue('salaryToBePaid', Number(value) + Number(getValues('attendanceAward')) + Number(getValues('productionAward')));
                                    }} />
                                {getFormErrorMessage(field.name)}
                            </div>
                        );
                    }}
                />
                <Controller
                    name='overtime'
                    control={control}
                    render={({ field, fieldState }) => {
                        return (
                            <div className='field col-3 md:col-3'>
                                <label htmlFor={field.name}>Horas extras</label>
                                <InputNumber id={field.name} mode="decimal" showButtons min={0} value={field.value}
                                    onValueChange={(event) => {
                                        const value = Number(event.value);
                                        setValue('overtime', value);
                                    }} />
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
                            <div className='field col-5 md:col-5'>
                                <label htmlFor={field.name} className={classNames({ 'p-error': errors.date })}>Data de pagamento*</label>
                                <Calendar id={field.name} {...field} className={classNames({ 'p-invalid': fieldState.error })}
                                    showIcon dateFormat="dd/mm/yy" />
                                {getFormErrorMessage(field.name)}
                            </div>
                        );
                    }}
                />
                <Controller
                    name='attendanceAward'
                    control={control}
                    rules={{ required: 'Prêmio por salubridade é obrigatório.' }}
                    render={({ field, fieldState }) => {
                        return (
                            <div className='field col-4 md:col-4'>
                                <label htmlFor={field.name} className={classNames({ 'p-error': errors.attendanceAward })}>Prêmio por salubridade*</label>
                                <InputNumber id={field.name} className={classNames({ 'p-invalid': fieldState.error })}
                                    mode="currency" currency="BRL" value={field.value}
                                    onValueChange={(event) => {
                                        const value = Number(event.value);
                                        setValue('attendanceAward', value);
                                        setValue('salaryToBePaid', Number(getValues('salary')) + Number(value) + Number(getValues('productionAward')));
                                    }} />
                                {getFormErrorMessage(field.name)}
                            </div>
                        );
                    }}
                />
                <Controller
                    name='productionAward'
                    control={control}
                    rules={{ required: 'Prêmio por produção é obrigatório.' }}
                    render={({ field, fieldState }) => {
                        return (
                            <div className='field col-4 md:col-4'>
                                <label htmlFor={field.name} className={classNames({ 'p-error': errors.productionAward })}>Prêmio por produção*</label>
                                <InputNumber id={field.name} className={classNames({ 'p-invalid': fieldState.error })}
                                    mode="currency" currency="BRL" value={field.value}
                                    onValueChange={(event) => {
                                        const value = Number(event.value);
                                        setValue('productionAward', value);
                                        setValue('salaryToBePaid', Number(getValues('salary')) + Number(getValues('attendanceAward')) + Number(value));
                                    }} />
                                {getFormErrorMessage(field.name)}
                            </div>
                        );
                    }}
                />
                <Controller
                    name='salaryToBePaid'
                    control={control}
                    render={({ field, fieldState }) => {
                        return (
                            <div className='field col-4 md:col-4'>
                                <label htmlFor={field.name} >Salário a ser pago</label>
                                <InputNumber id={field.name} mode="currency" currency="BRL" disabled readOnly value={field.value} />
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
                            props.setDisplayPayrollModal(false);
                        }} />
                    <Button
                        type="submit"
                        icon="pi pi-check"
                        label="Salvar"
                    />
                </div>
            </form>
        </Dialog>
    )
}