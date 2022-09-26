import { useEffect, useState } from "react";
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { FileUpload } from 'primereact/fileupload';
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { classNames } from 'primereact/utils';
import { Image } from 'primereact/image';
import { CustomerModel } from "../../models/CustomerModel";
import { ProductModel } from "../../models/ProductModel";
import { ResponseModel } from "../../models/ResponseModel";
import {
    Controller,
    Control,
    FieldErrorsImpl,
    DeepRequired,
    UseFormHandleSubmit,
    UseFormReset,
    UseFormSetValue
} from 'react-hook-form';

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
                value: customer.uid
            }
        }));
    }, [])

    function onSubmit(data: ProductModel) {
        setFormData(data);

        let route = data?.uid ? "/api/demand/products/update" : "/api/demand/products/add";
        const newProduct = ProductModel.clone(data);
        newProduct.image = image;
        newProduct.quantity = quantity;
        newProduct.unitaryValue = unitaryValue;
        
        fetch(route, {
            method: "POST",
            body: JSON.stringify(newProduct)
        })
            .then(response => response.json())
            .then((response: ResponseModel<ProductModel>) => {
                const customer = props.customers.find(item => item.uid == selectedCustomer);
                const product = ProductModel.clone(response.data);

                if (customer) {
                    product.setCustomer(customer);
                }

                props.setDisplayProductModal(false);
                props.onClickSave(product);
                props.reset(ProductModel.empty());
                setImage("");
                setAmount(0);
                setQuantity(0);
                setSelectedCustomer("");
                setUnitaryValue(0);
            });
    }

    function getFormErrorMessage(name: string) {
        if (props.errors[name as keyof ProductModel]) {
            return <small className="p-error">{props.errors[name as keyof ProductModel]?.message}</small>
        }
    };

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
                setSelectedCustomer(props.product.customerUid);
                props.setValue("customerUid", props.product.customerUid);
                setCustomerOptions(props.customers.map(customer => {
                    return {
                        label: customer.name,
                        value: customer.uid
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
            }}>
            <div className="pt-4">
                <form onSubmit={props.handleSubmit(onSubmit)} className="formgrid grid p-fluid">
                    <Controller name="uid" control={props.control} render={({ field, fieldState }) => (
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
                        <label htmlFor="customerUid" className={classNames({ 'p-error': props.errors.customerUid })}>Cliente*</label>
                        <Controller name="customerUid" control={props.control} rules={{ required: 'Cliente do produto é obrigatório.' }} render={({ field, fieldState }) => (
                            <Dropdown
                                id={field.name}
                                {...field}
                                onChange={(event) => {
                                    setSelectedCustomer(event.value);
                                    props.setValue("customerUid", event.value);
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