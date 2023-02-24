import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputMask } from 'primereact/inputmask';
import { Message } from 'primereact/message';

import { classNames } from 'primereact/utils';
import { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { useAuth } from "../../contexts/authContext"
import { CustomerModel } from "../../models/customerModel"
import { fetchServer } from "../../server"
import { CUSTOMER_ROUTE } from "../../server/configs"

export type CustomerModalProps = {
    onSave(customer: CustomerModel): void
    displayCustomerModal: boolean
    setDisplayCustomerModal(display: boolean): void
    action: 'Insert' | 'Update'
    customer: CustomerModel | null
}

export function CustomerModal(props: CustomerModalProps) {
    const { userSession } = useAuth();
    const [textError, setTextError] = useState<string>('');
    const [modalText, setModalText] = useState<string>('');
    const [method, setMethod] = useState<"POST" | "GET" | "DELETE" | "PUT">('POST');
    const [url, setUrl] = useState<string>('');
    const { handleSubmit, formState: { errors }, reset, control, setValue } = useForm<CustomerModel>({
        defaultValues: {}
    });

    useEffect(() => {
        if (props.action == 'Insert') {
            setUrl(CUSTOMER_ROUTE);
            setMethod('POST');
            setModalText('Adicionar cliente');
            setValue('id', '');
            setValue('name', '');
            setValue('cnpj', '');
            setValue('initials', '');
        } else {
            setMethod('PUT');
            setUrl(`${CUSTOMER_ROUTE}/${props.customer?.id}`);
            setModalText('Alterar cliente');
            setValue('id', props.customer?.id || '');
            setValue('name', props.customer?.name || '');
            setValue('cnpj', props.customer?.cnpj || '');
            setValue('initials', props.customer?.initials || '');
        }
    }, [props.action]);

    async function onSubmit(customer: CustomerModel) {
        fetchServer({
            route: url,
            method: method,
            user: userSession,
            body: JSON.stringify(customer)
        }).then(response => {
            if (response.error) {
                setTextError(response.error);
            } else {
                reset();
                setTextError('');
                props.onSave(response);
                props.setDisplayCustomerModal(false);
            }
        });
    }

    function getFormErrorMessage(property: string) {
        const error = errors[property as keyof CustomerModel];

        if (error) {
            return <small className='p-error'>{error?.message}</small>
        }
    }

    return (
        <Dialog
            header={modalText}
            visible={props.displayCustomerModal}
            modal breakpoints={{ '960px': '75vw' }}
            style={{ width: '40vw' }}
            onHide={() => {
                reset();
                props.setDisplayCustomerModal(false);
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
                    name='initials'
                    control={control}
                    rules={{ required: 'Sigla é obrigatória.' }}
                    render={({ field, fieldState }) => {
                        return (
                            <div className='field col-12 md:col-6'>
                                <label htmlFor={field.name} className={classNames({ 'p-error': errors.name })}>Sigla*</label>
                                <InputText id={field.name} {...field} className={classNames({ 'p-invalid': fieldState.error })} />
                                {getFormErrorMessage(field.name)}
                            </div>
                        );
                    }}
                />
                <Controller
                    name='cnpj'
                    control={control}
                    rules={{ required: 'CNPJ é obrigatório.' }}
                    render={({ field, fieldState }) => {
                        return (
                            <div className='field col-12 md:col-6'>
                                <label htmlFor={field.name} className={classNames({ 'p-error': errors.name })}>CNPJ*</label>
                                <InputMask id={field.name} {...field} mask="99.999.999/9999-99" className={classNames({ 'p-invalid': fieldState.error })} />
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
                            props.setDisplayCustomerModal(false);
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