import { useContext, useEffect, useState } from "react";
import { ProductModel } from "../../models/productModel";
import { CustomerModel } from "../../models/customerModel";
import { PRODUCT_ROUTE } from "../../server/configs";

import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { FileUpload } from 'primereact/fileupload';
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { classNames } from 'primereact/utils';
import { Image } from 'primereact/image';
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

type ProductModalProps = {
    productModalText: string,
    displayProductModal: boolean,
    setDisplayProductModal: (display: boolean) => void,
    customers: CustomerModel[],
    product: ProductModel,
    setProduct: (product: ProductModel) => void,
    onClickSave: (product: ProductModel) => void,
    control: Control<ProductModel, object>,
    errors: FieldErrorsImpl<DeepRequired<ProductModel>>,
    handleSubmit: UseFormHandleSubmit<ProductModel>,
    reset: UseFormReset<ProductModel>,
    setValue: UseFormSetValue<ProductModel>
}

export function ProductModal(props: ProductModalProps) {
    const { user } = useContext(AuthContext);
    const [formData, setFormData] = useState({});
    const [image, setImage] = useState<any>("");
    const [amount, setAmount] = useState<any>(props.product.amount);
    const [selectedCustomer, setSelectedCustomer] = useState<any>("");
    const [quantity, setQuantity] = useState(0);
    const [unitaryValue, setUnitaryValue] = useState(0);
    const [customerOptions, setCustomerOptions] = useState<any[]>([]);

    useEffect(() => {
        setCustomerOptions(props.customers.map(customer => {
            return {
                label: customer.name,
                value: customer.id
            }
        }));
    }, []);

    function onSubmit(data: ProductModel) {
        setFormData(data);

        const product = ProductModel.clone(data);
        product.image = image;
        product.quantity = quantity;
        product.unitaryValue = unitaryValue;
        
        let route: string = PRODUCT_ROUTE;
        route += data.id ? `/${data.id}` : "";

        fetchServer({
            route: route,
            method: "POST",
            user: user,
            body: JSON.stringify({
                id: product.id,
                customer: product.customer,
                idCustomer: product.idCustomer,
                reference: product.reference,
                of: product.of,
                description: product.description,
                quantity: product.quantity,
                unitaryValue: product.unitaryValue,
                amount: product.amount,
                status: product.status,
                date: product.date,
                image: "",
            })
        }).then((response: ProductModel) => {
            const customer = props.customers.find(item => item.id == selectedCustomer);
            const responseProduct = ProductModel.clone(response);

            if (customer) {
                responseProduct.customer = customer;
                responseProduct.idCustomer = customer.id;
            }

            if(responseProduct.id && product.image) {
                responseProduct.image = product.image;
                
                fetchServer({
                    route: `${PRODUCT_ROUTE}/${responseProduct.id}`,
                    method: "POST",
                    user: user,
                    body: JSON.stringify({
                        id: responseProduct.id,
                        customer: product.customer,
                        idCustomer: product.idCustomer,
                        reference: product.reference,
                        of: product.of,
                        description: product.description,
                        quantity: product.quantity,
                        unitaryValue: product.unitaryValue,
                        amount: product.amount,
                        status: product.status,
                        image: product.image,
                        date: product.date,
                    })
                });
            }

            props.setDisplayProductModal(false);
            props.onClickSave(responseProduct);
            props.reset(ProductModel.empty());
            setImage("");
            setAmount(0);
            setQuantity(0);
            setSelectedCustomer("");
            setUnitaryValue(0);
        });
    }

    function getFormErrorMessage(propertyName: string) {
        const property = props.errors[propertyName as keyof ProductModel];

        if (property) {
            return (
                <small className="p-error">
                    {property.message}
                </small>
            );
        }
    }

    const uploadOptions = { icon: 'pi pi-fw pi-cloud-upload', iconOnly: true, className: 'hidden' };

    return (
        <Dialog
            header={props.productModalText}
            visible={props.displayProductModal}
            onShow={() => {
                setImage(props.product.image);
                setAmount(props.product.amount);
                setQuantity(props.product.quantity);
                setUnitaryValue(props.product.unitaryValue);
                setSelectedCustomer(props.product.idCustomer);
                props.setValue("idCustomer", props.product.idCustomer);
                setCustomerOptions(props.customers.map(customer => {
                    return {
                        label: customer.name,
                        value: customer.id
                    }
                }));
            }}
            modal
            breakpoints={{ '960px': '75vw' }}
            style={{ width: '40vw' }}
            onHide={() => {
                props.reset(ProductModel.empty());
                setImage("");
                setAmount(0);
                setQuantity(0);
                setUnitaryValue(0);
                props.setDisplayProductModal(false);

                props.setValue("description", "");
                props.setValue("reference", "");
                props.setValue("of", "");
            }}>
            <div className="pt-4">
                <form onSubmit={props.handleSubmit(onSubmit)} className="formgrid grid p-fluid">
                    <Controller name="id" control={props.control} render={({ field, fieldState }) => (
                        <InputText
                            id={field.name} {...field} autoFocus hidden
                        />
                    )} />

                    <div className="field col-12 md:col-12 card-container border-3 border-round flex align-items-center justify-content-center gap-3 p-1">
                        <FileUpload
                            mode="basic"
                            name="demo[]"
                            chooseLabel="Selecione"
                            accept="image/*"
                            onSelect={(event) => {
                                const file = event.files[0];
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                    setImage(reader.result);
                                }
                                reader.readAsDataURL(file)
                            }}
                            onClear={() => {
                                setImage("");
                            }}
                        />
                        <Image src={image} alt="Imagem do produto" width="250" preview />
                    </div>
                    <div className="field col-12 md:col-12 mb-4">
                        <label htmlFor="description" className={classNames({ 'p-error': props.errors.description })}>Descrição*</label>
                        <Controller name="description" control={props.control} rules={{ required: 'Descrição do produto é obrigatório.' }} render={({ field, fieldState }) => (
                            <InputText
                                id={field.name} {...field} autoFocus
                                className={classNames({ 'p-invalid': fieldState.invalid })}
                            />
                        )} />
                        {getFormErrorMessage('description')}
                    </div>
                    <div className="field col-12 md:col-12 mb-4">
                        <label htmlFor="customerUid" className={classNames({ 'p-error': props.errors.idCustomer })}>Cliente*</label>
                        <Controller name="idCustomer" control={props.control} rules={{ required: 'Cliente do produto é obrigatório.' }} render={({ field, fieldState }) => (
                            <Dropdown
                                id={field.name}
                                {...field}
                                onChange={(event) => {
                                    setSelectedCustomer(event.value);
                                    props.setValue("idCustomer", event.value);
                                }}
                                value={selectedCustomer}
                                autoFocus
                                options={customerOptions}
                                placeholder="Selecione o cliente"
                            />
                        )} />
                        {getFormErrorMessage('customerUid')}
                    </div>
                    <div className="field col-6 md:col-6">
                        <label htmlFor="reference" className={classNames({ 'p-error': props.errors.reference })}>Referência*</label>
                        <Controller name="reference" control={props.control} rules={{ required: 'Referência do produto é obrigatório.' }} render={({ field, fieldState }) => (
                            <InputText
                                id={field.name} {...field} autoFocus
                                className={classNames({ 'p-invalid': fieldState.invalid })}
                            />
                        )} />
                        {getFormErrorMessage('reference')}
                    </div>
                    <div className="field col-6 md:col-6">
                        <label htmlFor="of" className={classNames({ 'p-error': props.errors.of })}>OF*</label>
                        <Controller name="of" control={props.control} rules={{ required: 'OF do produto é obrigatório.' }} render={({ field, fieldState }) => (
                            <InputText
                                id={field.name} {...field} autoFocus
                                className={classNames({ 'p-invalid': fieldState.invalid })}
                            />
                        )} />
                        {getFormErrorMessage('of')}
                    </div>
                    <div className="field col-4 md:col-4">
                        <label htmlFor="quantity" className={classNames({ 'p-error': props.errors.quantity })}>Quantidade*</label>
                        <Controller name="quantity" control={props.control} rules={{ required: 'Quantidade do produto é obrigatório.' }} render={({ field, fieldState }) => (
                            <InputNumber
                                id={field.name}
                                autoFocus
                                value={quantity}
                                className={classNames({ 'p-invalid': fieldState.invalid })}
                                mode="decimal"
                                showButtons
                                min={0}
                                onValueChange={(event) => {
                                    var value = Number(event.value);
                                    setQuantity(value);
                                    setAmount((value * unitaryValue));
                                    props.setValue("quantity", value);
                                }}
                            />
                        )} />
                        {getFormErrorMessage('quantity')}
                    </div>
                    <div className="field col-4 md:col-4">
                        <label htmlFor="unitaryValue" className={classNames({ 'p-error': props.errors.unitaryValue })}>Valor unitário*</label>
                        <Controller name="unitaryValue" control={props.control} rules={{ required: 'Valor uniátio do produto é obrigatório.' }} render={({ field, fieldState }) => (
                            <InputNumber
                                id={field.name}
                                autoFocus
                                value={unitaryValue}
                                className={classNames({ 'p-invalid': fieldState.invalid })}
                                showButtons
                                min={0}
                                buttonLayout="horizontal" step={0.25}
                                decrementButtonClassName="p-button-danger"
                                decrementButtonIcon="pi pi-minus"
                                incrementButtonClassName="p-button-success"
                                incrementButtonIcon="pi pi-plus"
                                mode="currency" currency="BRL"
                                onValueChange={(event) => {
                                    var value = Number(event.value);
                                    setUnitaryValue(value);
                                    setAmount((quantity * value));
                                    props.setValue("unitaryValue", value);
                                }}
                            />
                        )} />
                        {getFormErrorMessage('unitaryValue')}
                    </div>
                    <div className="field col-4 md:col-4">
                        <label htmlFor="amount" className={classNames({ 'p-error': props.errors.amount })}>Total</label>
                        <InputNumber
                            id={"amount"}
                            min={0}
                            value={amount}
                            disabled
                            readOnly
                            mode="currency"
                            currency="BRL"
                        />
                    </div>

                    <div className="field col-12 flex justify-content-end gap-3">
                        <Button
                            type="button"
                            icon="pi pi-times"
                            label="Cancelar"
                            className="p-button-text"
                            onClick={() => {
                                props.reset(ProductModel.empty());
                                setImage("");
                                setAmount(0);
                                setQuantity(0);
                                setUnitaryValue(0);
                                props.setDisplayProductModal(false);
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