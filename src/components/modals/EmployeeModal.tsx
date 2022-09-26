import { useState } from "react";
import { InputText } from 'primereact/inputtext';
import { InputMask } from 'primereact/inputmask';
import { Calendar } from 'primereact/calendar';
import { addLocale, locale } from 'primereact/api';
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { classNames } from 'primereact/utils';
import { Checkbox } from 'primereact/checkbox';
import { EmployeeModel } from "../../models/EmployeeModel";
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

type EmployeeModalProps = {
    employeeModalText: string,
    displayEmployeeModal: boolean,
    setDisplayEmployeeModal: (display: boolean) => void,
    employee: EmployeeModel,
    setEmployee: (employee: EmployeeModel) => void,
    onClickSave: (employee: EmployeeModel) => void,
    control: Control<EmployeeModel, object>,
    errors: FieldErrorsImpl<DeepRequired<EmployeeModel>>,
    handleSubmit: UseFormHandleSubmit<EmployeeModel>,
    reset: UseFormReset<EmployeeModel>,
    setValue: UseFormSetValue<EmployeeModel>
};

export function EmployeeModal(props: EmployeeModalProps) {
    const [formData, setFormData] = useState({});
    const [checked, setChecked] = useState<boolean>(true);
    const [date, setDate] = useState<any>(props.employee.birthDate);

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

    function onSubmit(data: EmployeeModel) {
        setFormData(data);
        data.birthDate = date;
        data.active = checked;

        let route = data?.uid ? "/api/employees/update" : "/api/employees/add";
        props.setDisplayEmployeeModal(false);

        fetch(route, {
            method: "POST",
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then((response: ResponseModel<EmployeeModel>) => {
                props.reset();
                props.onClickSave(response.data);
                setDate(null);
                setChecked(false);
            });
    }

    function getFormErrorMessage(name: string) {
        if (props.errors[name as keyof EmployeeModel]) {
            return <small className="p-error">{props.errors[name as keyof EmployeeModel]?.message}</small>
        }
    };

    return (
        <Dialog
            header={props.employeeModalText}
            visible={props.displayEmployeeModal}
            modal
            breakpoints={{ '960px': '75vw' }}
            style={{ width: '40vw' }}
            onShow={() => {
                setDate(new Date(props.employee.birthDate));
                setChecked(props.employee.active);
            }}
            onHide={() => {
                props.reset();
                setDate(null);
                setChecked(false);
                props.setDisplayEmployeeModal(false);
            }}>
            <div className="pt-4">
                <form onSubmit={props.handleSubmit(onSubmit)} className="formgrid grid p-fluid">
                    <Controller name="uid" control={props.control} render={({ field, fieldState }) => (
                        <InputText
                            id={field.name} {...field} autoFocus hidden
                        />
                    )} />
                    <div className="field col-12 md:col-12 mb-4">
                        <label htmlFor="name" className={classNames({ 'p-error': props.errors.name })}>Name*</label>
                        <Controller name="name" control={props.control} rules={{ required: 'Nome do funcionário é obrigatório.' }} render={({ field, fieldState }) => (
                            <InputText
                                id={field.name} {...field} autoFocus
                                className={classNames({ 'p-invalid': fieldState.invalid })}
                            />
                        )} />
                        {getFormErrorMessage('name')}
                    </div>
                    <div className="field col-12 md:col-6">
                        <label htmlFor="birthDate">Data de nascimento</label>
                        <Calendar
                            id={"birthDate"} showIcon dateFormat="dd/mm/yy"
                            value={date} onChange={(e) => setDate(e.value)}
                        />
                    </div>
                    <div className="field col-12 md:col-6">
                        <label htmlFor="cpf" className={classNames({ 'p-error': props.errors.name })}>CPF*</label>
                        <Controller name="cpf" control={props.control} rules={{ required: 'CPF do funcionário é obrigatório.' }} render={({ field, fieldState }) => (
                            <InputMask
                                mask="999.999.999-99"
                                id={field.name} {...field}
                                className={classNames({ 'p-invalid': fieldState.invalid })}
                            />
                        )} />
                        {getFormErrorMessage('cpf')}
                    </div>
                    <div className="field col-12 md:col-6">
                        <div className="field-checkbox">
                            <Checkbox id="active" checked={checked} onChange={e => setChecked(e.checked)} />
                            <label htmlFor="active">Ativo</label>
                        </div>
                    </div>

                    <div className="field col-12 flex justify-content-end gap-3">
                        <Button
                            type="button"
                            icon="pi pi-times"
                            label="Cancelar"
                            className="p-button-text"
                            onClick={() => {
                                props.reset();
                                props.setDisplayEmployeeModal(false);
                            }} />
                        <Button
                            type="submit"
                            icon="pi pi-check"
                            label="Salvar"
                        />
                    </div>
                </form>
            </div>
        </Dialog >
    );
}