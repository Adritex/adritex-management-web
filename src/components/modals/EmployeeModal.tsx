import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputMask } from "primereact/inputmask";
import { InputText } from "primereact/inputtext";
import { Message } from "primereact/message";
import { Calendar } from "primereact/calendar";
import { Checkbox } from "primereact/checkbox";

import { classNames } from "primereact/utils";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useAuth } from "../../contexts/authContext";
import { EmployeeModel } from "../../models/employeeModel";
import { fetchServer } from "../../server";
import { EMPLOYEE_ROUTE } from "../../server/configs";

export type EmployeeModalProps = {
    onSave(employee: EmployeeModel): void
    displayEmployeeModal: boolean
    setDisplayEmployeeModal(display: boolean): void
    action: 'Insert' | 'Update'
    setAction(action: 'Insert' | 'Update'): void
    employee: EmployeeModel | null
}

export function EmployeeModal(props: EmployeeModalProps) {
    const { userSession } = useAuth();
    const [textError, setTextError] = useState<string>('');
    const [modalText, setModalText] = useState<string>('');
    const [method, setMethod] = useState<'POST' | 'GET' | 'PUT' | 'DELETE'>('POST');
    const [url, setUrl] = useState<string>('');
    const { handleSubmit, formState: { errors }, reset, control, setValue } = useForm<EmployeeModel>({
        defaultValues: {}
    });

    useEffect(() => {
        if (props.action == 'Insert') {
            setMethod('POST');
            setUrl(`${EMPLOYEE_ROUTE}`);
            setModalText('Adicionar funcionário');
            setValue('id', '');
            setValue('name', '');
            setValue('cpf', '');
            setValue('birthDate', new Date());
            setValue('active', true);
        } else {
            setMethod('PUT');
            setUrl(`${EMPLOYEE_ROUTE}/${props.employee?.id}`);
            setModalText('Alterar funcionário');
            setValue('id', props.employee?.id || '');
            setValue('name', props.employee?.name || '');
            setValue('cpf', props.employee?.cpf || '');
            setValue('birthDate', new Date(props.employee?.birthDate || '') || new Date());
            setValue('active', props.employee?.active || false);
        }
    }, [props.action]);

    async function onSubmit(employee: EmployeeModel) {
        fetchServer({
            route: url,
            method: method,
            user: userSession,
            body: JSON.stringify(employee)
        }).then(response => {
            if (response.error) {
                setTextError(response.error);
            } else {
                reset();
                setTextError('');
                props.onSave(response);
                props.setDisplayEmployeeModal(false);
            }
        })
    }

    function getFormErrorMessage(property: string) {
        const error = errors[property as keyof EmployeeModel];

        if (error) {
            return <small className='p-error'>{error?.message}</small>
        }
    }

    return (
        <Dialog
            header={modalText}
            visible={props.displayEmployeeModal}
            modal breakpoints={{ '960px': '75vw' }}
            style={{ width: '40vw' }}
            onHide={() => {
                reset();
                props.setAction('Insert');
                props.setDisplayEmployeeModal(false);
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
                    name='birthDate'
                    control={control}
                    rules={{ required: 'Data de nascimento é obrigatória.' }}
                    render={({ field, fieldState }) => {
                        return (
                            <div className='field col-12 md:col-6'>
                                <label htmlFor={field.name} className={classNames({ 'p-error': errors.name })}>Data de nascimento*</label>
                                <Calendar showIcon dateFormat="dd/mm/yy" id={field.name} {...field} className={classNames({ 'p-invalid': fieldState.error })} />
                                {getFormErrorMessage(field.name)}
                            </div>
                        );
                    }}
                />
                <Controller
                    name='cpf'
                    control={control}
                    rules={{ required: 'CPF é obrigatório.' }}
                    render={({ field, fieldState }) => {
                        return (
                            <div className='field col-12 md:col-6'>
                                <label htmlFor={field.name} className={classNames({ 'p-error': errors.name })}>CPF*</label>
                                <InputMask mask="999.999.999-99" id={field.name} {...field} className={classNames({ 'p-invalid': fieldState.error })} />
                                {getFormErrorMessage(field.name)}
                            </div>
                        );
                    }}
                />
                <Controller
                    name='active'
                    control={control}
                    render={({ field, fieldState }) => {
                        return (
                            <div className='field col-12 md:col-6'>
                                <div className="field-checkbox">
                                    <Checkbox id={field.name} {...field} checked={field.value} />
                                    <label htmlFor={field.name}>Ativo</label>
                                </div>
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
                            props.setDisplayEmployeeModal(false);
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