import { useContext, useState } from "react";
import { InputText } from 'primereact/inputtext';
import { InputMask } from 'primereact/inputmask';
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { classNames } from 'primereact/utils';
import { CustomerModel } from "../../models/customerModel";
import { CUSTOMER_ROUTE } from "../../server/configs";
import {
    Controller,
    Control,
    FieldErrorsImpl,
    DeepRequired,
    UseFormHandleSubmit,
    UseFormReset,
    UseFormSetValue
} from 'react-hook-form';
import { fetchServer } from "../../server";
import { AuthContext } from "../../contexts/authContext";


type CustomerModalProps = {
    customerModalText: string,
    displayCustomerModal: boolean,
    setDisplayCustomerModal: (display: boolean) => void,
    customer: CustomerModel,
    setCustomer: (customer: CustomerModel) => void,
    onClickSave: (customer: CustomerModel) => void,
    control: Control<CustomerModel, object>,
    errors: FieldErrorsImpl<DeepRequired<CustomerModel>>,
    handleSubmit: UseFormHandleSubmit<CustomerModel>,
    reset: UseFormReset<CustomerModel>,
    setValue: UseFormSetValue<CustomerModel>
};

export function CustomerModal(props: CustomerModalProps) {
    const { user } = useContext(AuthContext);
    const [formData, setFormData] = useState({});

    function onSubmit(data: CustomerModel) {
        setFormData(data);

        let route: string = CUSTOMER_ROUTE;
        route += data.id ? `/${data.id}` : '';

        fetchServer({
            route: route,
            method: "POST",
            user: user,
            body: JSON.stringify(data)
        }).then((response: CustomerModel) => {
            props.reset();
            props.onClickSave(response);
            props.setDisplayCustomerModal(false);
        })
    }

    function getFormErrorMessage(propertyName: string) {
        const property = props.errors[propertyName as keyof CustomerModel];

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
            header={props.customerModalText}
            visible={props.displayCustomerModal}
            modal
            breakpoints={{ '960px': '75vw' }}
            style={{ width: '40vw' }}
            onHide={() => {
                props.reset();
                props.setDisplayCustomerModal(false);
            }}>
            <div className="pt-4">
                <form onSubmit={props.handleSubmit(onSubmit)} className="formgrid grid p-fluid">
                    <Controller name="id" control={props.control} render={({ field, fieldState }) => (
                        <InputText
                            id={field.name} {...field} autoFocus hidden
                        />
                    )} />
                    <div className="field col-12 md:col-12 mb-4">
                        <label htmlFor="name" className={classNames({ 'p-error': props.errors.name })}>Name*</label>
                        <Controller name="name" control={props.control} rules={{ required: 'Campo é obrigatório.' }} render={({ field, fieldState }) => (
                            <InputText
                                id={field.name} {...field} autoFocus
                                className={classNames({ 'p-invalid': fieldState.invalid })}
                            />
                        )} />
                        {getFormErrorMessage('name')}
                    </div>
                    <div className="field col-12 md:col-6">
                        <label htmlFor="initials" className={classNames({ 'p-error': props.errors.name })}>Sigla*</label>
                        <Controller name="initials" control={props.control} rules={{ required: 'Campo é obrigatório.' }} render={({ field, fieldState }) => (
                            <InputText
                                id={field.name} {...field}
                                className={classNames({ 'p-invalid': fieldState.invalid })}
                            />
                        )} />
                        {getFormErrorMessage('initials')}
                    </div>
                    <div className="field col-12 md:col-6">
                        <label htmlFor="cnpj" className={classNames({ 'p-error': props.errors.name })}>CNPJ*</label>
                        <Controller name="cnpj" control={props.control} rules={{ required: 'Campo é obrigatório e único.' }} render={({ field, fieldState }) => (
                            <InputMask
                                mask="99.999.999/9999-99"
                                id={field.name} {...field}
                                className={classNames({ 'p-invalid': fieldState.invalid })}
                            />
                        )} />
                        {getFormErrorMessage('cnpj')}
                    </div>

                    <div className="field col-12 flex justify-content-end gap-3">
                        <Button
                            type="button"
                            icon="pi pi-times"
                            label="Cancelar"
                            className="p-button-text"
                            onClick={() => {
                                props.reset();
                                props.setDisplayCustomerModal(false);
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