import { Controller, useForm } from "react-hook-form"
import { useAuth } from "../../contexts/authContext"
import { UserInfoModel } from "../../models/userInfoModel"
import { useState } from "react"
import { Dialog } from "primereact/dialog"
import { Message } from "primereact/message"
import { InputText } from "primereact/inputtext"
import { classNames } from "primereact/utils"
import { Password } from "primereact/password"
import { Button } from "primereact/button"
import { USER_ROUTE } from "../../server/configs"
import { fetchServer } from "../../server"

export type ChangeUserPasswordModalProps = {
    displayChangeUserPasswordModal: boolean
    setDisplayChangeUserPasswordModal(display: boolean): void
    user: UserInfoModel | null
    onPasswordChanged(user: UserInfoModel): void
}

export function ChangeUserPasswordModal(props: ChangeUserPasswordModalProps) {
    const { userSession } = useAuth();
    const [textError, setTextError] = useState<string>('');
    const { handleSubmit, formState: { errors }, reset, control, setValue } = useForm<UserInfoModel>({
        defaultValues: {}
    });

    async function onSubmit(userInfo: UserInfoModel) {
        fetchServer({
            route: `${USER_ROUTE}/${props.user?.id}/change-password`,
            method: "PUT",
            user: userSession,
            body: JSON.stringify({
                password: userInfo.password,
            })
        }).then(response => {
            if (response.error) {
                setTextError(response.error);
            } else {
                reset();
                setTextError('');
                props.onPasswordChanged(userInfo);
                props.setDisplayChangeUserPasswordModal(false);
            }
        });
    }

    function getFormErrorMessage(property: string) {
        const error = errors[property as keyof UserInfoModel];

        if (error) {
            return <small className='p-error'>{error?.message}</small>
        }
    }

    return (
        <Dialog
            header={"Alterar senha do usuário"}
            visible={props.displayChangeUserPasswordModal}
            modal breakpoints={{ '960px': '75vw' }}
            style={{ width: '40vw' }}
            onHide={() => {
                reset();
                props.setDisplayChangeUserPasswordModal(false);
            }}>
            {textError ? <Message severity='error' text={textError} className='w-full mb-2' /> : <></>}
            <form onSubmit={handleSubmit(onSubmit)} className="formgrid grid p-fluid">
                <Controller name="id" control={control} render={({ field, fieldState }) => (
                    <InputText id={field.name} {...field} autoFocus hidden />
                )} />
                <Controller
                    name='password'
                    control={control}
                    rules={{ required: 'Senha é obrigatória.' }}
                    render={({ field, fieldState }) => {
                        return (
                            <div className='field col-12 md:col-12'>
                                <label htmlFor={field.name} className={classNames({ 'p-error': errors.password })}>Nova senha*</label>
                                <Password id={field.name} {...field}
                                    inputRef={field.ref} toggleMask
                                    feedback={false}
                                    className={classNames({ 'p-invalid': fieldState.error })}
                                />
                                {getFormErrorMessage(field.name)}
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
                            props.setDisplayChangeUserPasswordModal(false);
                        }} />
                    <Button
                        type="submit"
                        icon="pi pi-check"
                        label="Salvar"
                    />
                </div>
            </form>
        </Dialog>
    )
}