import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Calendar } from 'primereact/calendar';

import { useState } from "react";
import { classNames } from 'primereact/utils';
import { addLocale, locale } from 'primereact/api';
import { PayrollModel } from '../../models/PayrollModel';
import { EmployeeModel } from '../../models/EmployeeModel';
import { ResponseModel } from '../../models/ResponseModel';
import {
    Controller,
    Control,
    FieldErrorsImpl,
    DeepRequired,
    UseFormHandleSubmit,
    UseFormReset,
    UseFormSetValue
} from 'react-hook-form';

type PayrollModalProps = {
    payrollModalText: string,
    displayPayrollModal: boolean,
    setDisplayPayrollModal: (display: boolean) => void,
    employees: EmployeeModel[],
    payroll: PayrollModel,
    setPayroll: (payroll: PayrollModel) => void,
    onClickSave: (payroll: PayrollModel) => void,
    control: Control<PayrollModel, object>,
    errors: FieldErrorsImpl<DeepRequired<PayrollModel>>,
    handleSubmit: UseFormHandleSubmit<PayrollModel>,
    reset: UseFormReset<PayrollModel>,
    setValue: UseFormSetValue<PayrollModel>
}

export function PayrollModal(props: PayrollModalProps) {
    const [formData, setFormData] = useState({});
    const [selectedEmployee, setSelectedEmployee] = useState<any>("");
    const [employeeOptions, setEmployeeOptions] = useState<any[]>([]);
    const [salary, setSalary] = useState<number>(0);
    const [overtime, setOvertime] = useState<number>(0);
    const [attendanceAward, setAttendanceAward] = useState<number>(0);
    const [productionAward, setProductionAward] = useState<number>(0);
    const [salaryToBePaid, setSalaryToBePaid] = useState<number>(0);
    const [date, setDate] = useState<any>(props.payroll.date);

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

    function onSubmit(data: PayrollModel) {
        setFormData(data);
        data.date = date;
        data.overtime = overtime;
        data.setAttendanceAward(attendanceAward);
        data.setProductionAward(productionAward);
        data.setSalary(salary);

        let route = data?.uid ? "/api/financial/payrolls/update" : "/api/financial/payrolls/add";

        fetch(route, {
            method: "POST",
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then((response: ResponseModel<PayrollModel>) => {
                const employee = props.employees.find(item => item.uid == selectedEmployee);
                const payroll = PayrollModel.clone(response.data);

                if (employee) {
                    payroll.setEmployee(employee);
                }

                props.setDisplayPayrollModal(false);
                props.onClickSave(payroll);
                props.reset(PayrollModel.empty());
                setSelectedEmployee(0);
                setAttendanceAward(0);
                setProductionAward(0);
                setOvertime(0);
                setSalary(0);
                setSalaryToBePaid(0);
                setDate(null);
            });
    }

    function getFormErrorMessage(name: string) {
        if (props.errors[name as keyof PayrollModel]) {
            return <small className="p-error">{props.errors[name as keyof PayrollModel]?.message}</small>
        }
    };


    return (
        <Dialog
            header={props.payrollModalText}
            visible={props.displayPayrollModal}
            onShow={() => {
                setDate(new Date(props.payroll.date));
                setSelectedEmployee(props.payroll.employeeUid);
                setAttendanceAward(props.payroll.attendanceAward);
                setProductionAward(props.payroll.productionAward);
                setOvertime(props.payroll.overtime);
                setSalary(props.payroll.salary);
                setSalaryToBePaid(
                    props.payroll.salary +
                    props.payroll.attendanceAward +
                    props.payroll.productionAward
                );

                setEmployeeOptions(props.employees.map(employee => {
                    return {
                        label: employee.name,
                        value: employee.uid
                    }
                }));
            }}
            modal
            breakpoints={{ '960px': '75vw' }}
            style={{ width: '40vw' }}
            onHide={() => {
                props.reset(PayrollModel.empty());
                setSelectedEmployee(0);
                setAttendanceAward(0);
                setProductionAward(0);
                setOvertime(0);
                setSalary(0);
                setSalaryToBePaid(0);
                setDate(null);
                props.setDisplayPayrollModal(false);
            }}>
            <div className="pt-4">
                <form onSubmit={props.handleSubmit(onSubmit)} className="formgrid grid p-fluid">
                    <Controller name="uid" control={props.control} render={({ field, fieldState }) => (
                        <InputText
                            id={field.name} {...field} autoFocus hidden
                        />
                    )} />
                    <div className="field col-12 md:col-12 mb-4">
                        <label htmlFor="employeeUid" className={classNames({ 'p-error': props.errors.employeeUid })}>Funcionário*</label>
                        <Controller name="employeeUid" control={props.control} rules={{ required: 'Funcionário é obrigatório.' }} render={({ field, fieldState }) => (
                            <Dropdown
                                id={field.name}
                                {...field}
                                onChange={(event) => {
                                    setSelectedEmployee(event.value);
                                    props.setValue("employeeUid", event.value);
                                }}
                                value={selectedEmployee}
                                autoFocus
                                options={employeeOptions}
                                placeholder="Selecione o funcionário"
                            />
                        )} />
                        {getFormErrorMessage('employeeUid')}
                    </div>
                    <div className="field col-4 md:col-4">
                        <label htmlFor="salary" className={classNames({ 'p-error': props.errors.salary })}>Salário*</label>
                        <Controller name="salary" control={props.control} rules={{ required: 'Salário é obrigatório.' }} render={({ field, fieldState }) => (
                            <InputNumber
                                id={field.name}
                                autoFocus
                                value={salary}
                                className={classNames({ 'p-invalid': fieldState.invalid })}
                                min={0}
                                mode="currency" currency="BRL"
                                onValueChange={(event) => {
                                    const value = Number(event.value);
                                    setSalary(value);
                                    props.setValue("salary", value);
                                    setSalaryToBePaid(value + attendanceAward + productionAward);
                                }}
                            />
                        )} />
                        {getFormErrorMessage('salary')}
                    </div>

                    <div className="field col-3 md:col-3">
                        <label htmlFor="overtime" className={classNames({ 'p-error': props.errors.overtime })}>Horas extras*</label>
                        <Controller name="overtime" control={props.control} rules={{ required: 'Horas extras é obrigatório.' }} render={({ field, fieldState }) => (
                            <InputNumber
                                id={field.name}
                                autoFocus
                                value={overtime}
                                className={classNames({ 'p-invalid': fieldState.invalid })}
                                mode="decimal"
                                showButtons
                                min={0}
                                onValueChange={(event) => {
                                    const value = Number(event.value);
                                    setOvertime(value);
                                    props.setValue("overtime", value);
                                }}
                            />
                        )} />
                        {getFormErrorMessage('overtime')}
                    </div>

                    <div className="field col-5 md:col-5">
                        <label htmlFor="date">Data do pagamento</label>
                        <Calendar
                            id={"date"} showIcon dateFormat="dd/mm/yy"
                            value={date} onChange={(e) => {
                                setDate(e.value);
                            }}
                        />
                    </div>

                    <div className="field col-4 md:col-4">
                        <label htmlFor="attendanceAward" className={classNames({ 'p-error': props.errors.attendanceAward })}>Prêmio por salubridade*</label>
                        <Controller name="attendanceAward" control={props.control} rules={{ required: 'Prêmio por salubridade é obrigatório.' }} render={({ field, fieldState }) => (
                            <InputNumber
                                id={field.name}
                                autoFocus
                                value={attendanceAward}
                                className={classNames({ 'p-invalid': fieldState.invalid })}
                                min={0}
                                mode="currency" currency="BRL"
                                onValueChange={(event) => {
                                    const value = Number(event.value);
                                    setAttendanceAward(value);
                                    props.setValue("attendanceAward", value);
                                    setSalaryToBePaid(salary + value + productionAward);
                                }}
                            />
                        )} />
                        {getFormErrorMessage('attendanceAward')}
                    </div>

                    <div className="field col-4 md:col-4">
                        <label htmlFor="productionAward" className={classNames({ 'p-error': props.errors.productionAward })}>Prêmio por produção*</label>
                        <Controller name="productionAward" control={props.control} rules={{ required: 'Prêmio por produção é obrigatório.' }} render={({ field, fieldState }) => (
                            <InputNumber
                                id={field.name}
                                autoFocus
                                value={productionAward}
                                className={classNames({ 'p-invalid': fieldState.invalid })}
                                min={0}
                                mode="currency" currency="BRL"
                                onValueChange={(event) => {
                                    const value = Number(event.value);
                                    setProductionAward(value);
                                    props.setValue("productionAward", value);
                                    setSalaryToBePaid(salary + attendanceAward + value);
                                }}
                            />
                        )} />
                        {getFormErrorMessage('productionAward')}
                    </div>

                    <div className="field col-4 md:col-4">
                        <label htmlFor="salaryToBePaid" className={classNames({ 'p-error': props.errors.salaryToBePaid })}>Salário a ser pago</label>
                        <InputNumber
                            id={"salaryToBePaid"}
                            min={0}
                            value={salaryToBePaid}
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
                                props.reset();
                                setSelectedEmployee(0);
                                setAttendanceAward(0);
                                setProductionAward(0);
                                setOvertime(0);
                                setSalary(0);
                                setSalaryToBePaid(0);
                                setDate(null);
                                props.setDisplayPayrollModal(false);
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