import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';

type DataTableHeaderProps = {
    description: string,
    selectedModels: any[],
    filters: any,
    setFilters: (filter: any) => void,
    globalFilterValue: string,
    setGlobalFilterValue: (globalFilter: string) => void,
    onClickNewItem: () => void,
    onClickUpdateItem: () => void,
    onClickDeleteItem: () => void,
    showExportButtons: boolean,
    onClickExportPDF: () => void,
    onClickExportXLS: () => void,
    otherButtons: () => any;
}

export function DataTableHeader(props: DataTableHeaderProps) {
    function onGlobalFilterChange(event: any) {
        const value = event.target.value;
        let _filters = { ...props.filters };
        _filters['global'].value = value;

        props.setFilters(_filters);
        props.setGlobalFilterValue(value);
    }

    function showExportButtons() {
        if (props.showExportButtons) {
            return (
                <>
                    <Button
                        label="PDF"
                        icon="pi pi-file-pdf"
                        className="p-button-danger"
                        onClick={props.onClickExportPDF}
                    />
                </>
            );
        }
    }
    
    return (
        <div className="flex justify-content-between align-items-center">
            <h5 className="m-0">{props.description}</h5>
            <div className="flex align-items-center gap-3">
                <span className="p-buttonset">
                    {showExportButtons()}
                    {props.otherButtons()}
                    <Button
                        label="Novo"
                        icon="pi pi-plus"
                        onClick={props.onClickNewItem}
                    />
                    <Button
                        label="Alterar"
                        icon="pi pi-pencil"
                        disabled={!(props.selectedModels.length == 1)}
                        onClick={props.onClickUpdateItem}
                    />
                    <Button
                        label="Deletar"
                        icon="pi pi-trash"
                        disabled={!(props.selectedModels.length > 0)}
                        onClick={props.onClickDeleteItem}
                    />
                </span>
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText value={props.globalFilterValue} onChange={onGlobalFilterChange} placeholder="Pesquisar..." />
                </span>
            </div>
        </div>
    );
}