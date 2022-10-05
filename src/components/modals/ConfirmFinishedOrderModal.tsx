import { useState } from "react";
import { addLocale, locale } from 'primereact/api';

import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Calendar } from 'primereact/calendar';


type ConfirmFinishedOrderProps = {
    displayConfirmFinishedOrderModal: boolean,
    setDisplayConfirmFinishedOrderModal: (display: boolean) => void,
    onConfirm: (date: string) => void,
}

export function ConfirmFinishedOrderModal(props: ConfirmFinishedOrderProps) {
    const [date, setDate] = useState<any>();

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

    function renderFooter() {
        return (
            <div>
                <Button
                    label="Não"
                    icon="pi pi-times"
                    className="p-button-secondary p-button-text"
                    onClick={() => {
                        props.setDisplayConfirmFinishedOrderModal(false);
                    }} />
                <Button
                    label="Sim"
                    icon="pi pi-check"
                    autoFocus
                    onClick={() => {
                        props.onConfirm(date ?? new Date());
                        props.setDisplayConfirmFinishedOrderModal(false);
                    }} />
            </div>
        );
    }

    return (
        <Dialog
            header={"Finalizar ordem de produção"}
            visible={props.displayConfirmFinishedOrderModal}
            modal
            footer={renderFooter}
            breakpoints={{ '960px': '75vw' }}
            style={{ width: '40vw' }}
            onShow={() => {
                setDate(null);
            }}
            onHide={() => {
                props.setDisplayConfirmFinishedOrderModal(false);
                setDate(null);
            }}>
            <form className="formgrid grid p-fluid">
                <div className="field col-12 md:col-12">
                    <label htmlFor="date">Selecione a data em que o pedido foi finalizado. Caso não selecione, o valor padrão será a data de hoje.</label>
                    <Calendar
                        id={"date"} showIcon dateFormat="dd/mm/yy"
                        value={date} onChange={(e) => {
                            setDate(e.value);
                        }}
                    />
                </div>
            </form>
        </Dialog>
    );
}