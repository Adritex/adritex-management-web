import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Image } from 'primereact/image';
import { FileUpload } from 'primereact/fileupload';
import { Message } from 'primereact/message';

import { classNames } from 'primereact/utils';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/authContext';
import { PRODUCT_ROUTE } from '../../server/configs';
import { fetchServer } from '../../server';
import { ProductModel } from '../../models/productModel';
import { CustomerModel } from '../../models/customerModel';

export type ProductModalProps = {
    onSave(product: ProductModel): void
    displayProductModal: boolean
    setDisplayProductModal(display: boolean): void
    action: 'Insert' | 'Update'
    setAction(action: 'Insert' | 'Update'): void
    product: ProductModel | null
    customers: CustomerModel[]
}

export function ProductModal(props: ProductModalProps) {
    const { userSession } = useAuth();
    const [textError, setTextError] = useState<string>('');
    const [modalText, setModalText] = useState<string>('');
    const [customerOptions, setCustomerOptions] = useState<any[]>([]);
    const [method, setMethod] = useState<"POST" | "GET" | "DELETE" | "PUT">('POST');
    const [url, setUrl] = useState<string>('');
    const { handleSubmit, formState: { errors }, reset, control, setValue, getValues } = useForm<ProductModel>({
        defaultValues: {}
    });

    useEffect(() => {
        setCustomerOptions(props.customers.map(customer => {
            return {
                label: customer.name,
                value: customer.id
            }
        }));

        if (props.action == 'Insert') {
            setUrl(PRODUCT_ROUTE);
            setMethod('POST');
            setModalText('Adicionar pedido');
            setValue('id', '');
            setValue('customer', null);
            setValue('reference', '');
            setValue('of', '');
            setValue('description', '');
            setValue('quantity', 0);
            setValue('unitaryValue', 0);
            setValue('status', 0);
            setValue('amount', 0);
            setValue('image', '');
            setValue('idCustomer', '');
        } else {
            setUrl(`${PRODUCT_ROUTE}/${props.product?.id}`);
            setMethod('PUT');
            setModalText('Atualizar pedido');
            setValue('id', props.product?.id || '');
            setValue('customer', props.product?.customer || null);
            setValue('idCustomer', props.product?.customer?.id || '');
            setValue('reference', props.product?.reference || '');
            setValue('of', props.product?.of || '');
            setValue('description', props.product?.description || '');
            setValue('quantity', Number(props.product?.quantity) || 0);
            setValue('unitaryValue', Number(props.product?.unitaryValue) || 0);
            setValue('status', Number(props.product?.status) || 0);
            setValue('amount', Number(props.product?.amount) || 0);
            setValue('image', props.product?.image || '');
        }
    }, [props.displayProductModal]);

    async function onSubmit(product: ProductModel) {
        fetchServer({
            route: url,
            method: method,
            user: userSession,
            body: JSON.stringify(product)
        }).then(response => {
            if (response.error) {
                setTextError(response.error);
            } else {
                reset();
                setTextError('');
                props.onSave(response);
                props.setDisplayProductModal(false);
            }
        });
    }

    function getFormErrorMessage(property: string) {
        const error = errors[property as keyof ProductModel];

        if (error) {
            return <small className='p-error'>{error?.message}</small>
        }
    }

    return (
        <Dialog
            header={modalText}
            visible={props.displayProductModal}
            modal breakpoints={{ '960px': '75vw' }}
            style={{ width: '40vw' }}
            onHide={() => {
                reset();
                props.setAction('Insert');
                props.setDisplayProductModal(false);
            }}>
            {textError ? <Message severity='error' text={textError} className='w-full mb-2' /> : <></>}
            <form onSubmit={handleSubmit(onSubmit)} className="formgrid grid p-fluid">
                <Controller name="id" control={control} render={({ field, fieldState }) => (
                    <InputText id={field.name} {...field} autoFocus hidden />
                )} />
                <Controller
                    name='image'
                    control={control}
                    render={({ field, fieldState }) => {
                        return (
                            <div className='field col-12 md:col-12 card-container border-3 border-round flex align-items-center justify-content-center gap-3 p-1'>
                                <FileUpload
                                    mode="basic"
                                    name="demo[]"
                                    chooseLabel="Selecione"
                                    accept="image/*"
                                    onSelect={(event) => {
                                        const file = event.files[0];
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                            setValue('image', reader.result);
                                        }
                                        reader.readAsDataURL(file)
                                    }}
                                    onClear={() => {
                                        setValue('image', '');
                                    }}
                                />
                                <Image src={field.value?.toString()} alt="Imagem do produto" width="250" preview />
                            </div>
                        );
                    }}
                />
                <Controller
                    name='description'
                    control={control}
                    rules={{ required: 'Descrição é obrigatório.' }}
                    render={({ field, fieldState }) => {
                        return (
                            <div className='field col-12 md:col-12'>
                                <label htmlFor={field.name} className={classNames({ 'p-error': errors.description })}>Descrição*</label>
                                <InputText id={field.name} {...field} className={classNames({ 'p-invalid': fieldState.error })} />
                                {getFormErrorMessage(field.name)}
                            </div>
                        );
                    }}
                />
                <Controller
                    name='idCustomer'
                    control={control}
                    rules={{ required: 'Cliente é obrigatório.' }}
                    render={({ field, fieldState }) => {
                        return (
                            <div className='field col-12 md:col-12'>
                                <label htmlFor={field.name} className={classNames({ 'p-error': errors.idCustomer })}>Cliente*</label>
                                <Dropdown id={field.name} {...field} className={classNames({ 'p-invalid': fieldState.error })}
                                    options={customerOptions}
                                    filter
                                    emptyMessage="Nenhum cliente encontrado"
                                    emptyFilterMessage="Nenhum cliente encontrado"
                                    placeholder="Selecione o cliente"
                                    onChange={(event) => {
                                        setValue("idCustomer", event.value);
                                    }} />
                                {getFormErrorMessage(field.name)}
                            </div>
                        );
                    }}
                />
                <Controller
                    name='reference'
                    control={control}
                    rules={{ required: 'Referência é obrigatório.' }}
                    render={({ field, fieldState }) => {
                        return (
                            <div className='field col-6 md:col-6'>
                                <label htmlFor={field.name} className={classNames({ 'p-error': errors.reference })}>Referência*</label>
                                <InputText id={field.name} {...field} className={classNames({ 'p-invalid': fieldState.error })} />
                                {getFormErrorMessage(field.name)}
                            </div>
                        );
                    }}
                />
                <Controller
                    name='of'
                    control={control}
                    rules={{ required: 'OF é obrigatório.' }}
                    render={({ field, fieldState }) => {
                        return (
                            <div className='field col-6 md:col-6'>
                                <label htmlFor={field.name} className={classNames({ 'p-error': errors.of })}>OF*</label>
                                <InputText id={field.name} {...field} className={classNames({ 'p-invalid': fieldState.error })} />
                                {getFormErrorMessage(field.name)}
                            </div>
                        );
                    }}
                />
                <Controller
                    name='quantity'
                    control={control}
                    rules={{ required: 'Quantidade é obrigatória.' }}
                    render={({ field, fieldState }) => {
                        return (
                            <div className='field col-4 md:col-4'>
                                <label htmlFor={field.name} className={classNames({ 'p-error': errors.quantity })}>Quantidade*</label>
                                <InputNumber id={field.name} mode="decimal" showButtons min={0} value={field.value}
                                    className={classNames({ 'p-invalid': fieldState.error })}
                                    onValueChange={(event) => {
                                        const value = Number(event.value);
                                        setValue('quantity', value);
                                        setValue('amount', (value * Number(getValues('unitaryValue'))));
                                    }} />
                            </div>
                        );
                    }}
                />
                <Controller
                    name='unitaryValue'
                    control={control}
                    rules={{ required: 'Valor unitário é obrigatório.' }}
                    render={({ field, fieldState }) => {
                        return (
                            <div className='field col-4 md:col-4'>
                                <label htmlFor={field.name} className={classNames({ 'p-error': errors.unitaryValue })}>Valor unitário*</label>
                                <InputNumber id={field.name} className={classNames({ 'p-invalid': fieldState.error })}
                                    mode="currency" currency="BRL" value={field.value}
                                    buttonLayout="horizontal" step={0.25}
                                    decrementButtonClassName="p-button-danger"
                                    decrementButtonIcon="pi pi-minus"
                                    incrementButtonClassName="p-button-success"
                                    incrementButtonIcon="pi pi-plus"
                                    onValueChange={(event) => {
                                        const value = Number(event.value);
                                        setValue('unitaryValue', value);
                                        setValue('amount', (Number(getValues('quantity')) * value));
                                    }} />
                                {getFormErrorMessage(field.name)}
                            </div>
                        );
                    }}
                />
                <Controller
                    name='amount'
                    control={control}
                    render={({ field, fieldState }) => {
                        return (
                            <div className='field col-4 md:col-4'>
                                <label htmlFor={field.name}>Total</label>
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
                            props.setDisplayProductModal(false);
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