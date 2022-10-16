import { useContext, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { fetchServer } from "../../server";
import { InputNumber } from "primereact/inputnumber";
import { GoalModel } from "../../models/goalModel";
import { GOAL_ROUTE } from "../../server/configs";

type GoalModalProps = {
    goal: GoalModel;
    displayGoalModal: boolean;
    setDisplayGoalModal: (display: boolean) => void;
    onClickSaveGoal: (goal: GoalModel) => void;
}

export function GoalModal(props: GoalModalProps) {
    const [goal, setGoal] = useState<GoalModel>(GoalModel.empty());

    return (
        <Dialog
            header={"Definir metas"}
            visible={props.displayGoalModal}
            modal
            breakpoints={{ '960px': '75vw' }}
            style={{ width: '50vw' }}
            onShow={() => {
                setGoal(props.goal);
            }}
            onHide={() => {
                props.setDisplayGoalModal(false);
            }}>
            <div className="pt-4">
                <form className="formgrid grid p-fluid">
                    <div className="field col-6 md:col-6">
                        <label htmlFor="expectedQuantity">Expectativa da meta*</label>
                        <InputNumber
                                id={"expectedQuantity"}
                                autoFocus
                                value={goal.expectedQuantity}
                                mode="decimal"
                                showButtons
                                min={0}
                                onValueChange={(event: any) => {
                                    const value = Number(event.value);
                                    goal.expectedQuantity = value;
                                }}
                            />
                    </div>
                    <div className="field col-6 md:col-6">
                        <label htmlFor="currentQuantity">Valor atual da meta*</label>
                        <InputNumber
                                id={"currentQuantity"}
                                autoFocus
                                value={goal.currentQuantity}
                                mode="decimal"
                                showButtons
                                min={0}
                                onValueChange={(event: any) => {
                                    const value = Number(event.value);
                                    goal.currentQuantity = value;
                                }}
                            />
                    </div>
                    <div className="field col-12 flex justify-content-end gap-3">
                        <Button
                            type="button"
                            icon="pi pi-times"
                            label="Cancelar"
                            className="p-button-text"
                            onClick={() => {
                                props.setDisplayGoalModal(false);
                            }} />
                        <Button
                            type="button"
                            icon="pi pi-check"
                            label="Salvar"
                            onClick={() => {
                               props.onClickSaveGoal(goal);
                               props.setDisplayGoalModal(false);
                            }}
                        />
                    </div>
                </form>
            </div>
        </Dialog>
    );
}
