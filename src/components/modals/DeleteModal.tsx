import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";

type DeleteModalProps = {
    deleteModalHeader: string,
    deleteModalDescription: string,
    displayDeleteModal: boolean,
    setDisplayDeleteModal: (display: boolean) => void,
    onClickDelete: (models: any[]) => void,
    models: any[]
};

export function DeleteModal(props: DeleteModalProps) {
    function renderFooter() {
        return (
            <div>
                <Button
                    label="Cancelar"
                    icon="pi pi-times"
                    className="p-button-secondary p-button-text"
                    onClick={() => {
                        props.onClickDelete([]);
                        props.setDisplayDeleteModal(false);
                    }} />
                <Button
                    label="Remover"
                    icon="pi pi-trash"
                    autoFocus
                    className="p-button-danger"
                    onClick={() => {
                        props.onClickDelete(props.models);
                        props.setDisplayDeleteModal(false);
                    }} />
            </div>
        );
    }

    return (
        <Dialog
            header={props.deleteModalHeader}
            visible={props.displayDeleteModal}
            modal
            footer={renderFooter}
            breakpoints={{ '960px': '75vw' }}
            style={{ width: '40vw' }}
            onHide={() => {
                props.onClickDelete([]);
                props.setDisplayDeleteModal(false);
            }}>
            <p>{props.deleteModalDescription}</p>
        </Dialog>
    );
}