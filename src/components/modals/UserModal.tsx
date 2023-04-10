import { Button } from "primereact/button"
import { Dialog } from "primereact/dialog"
import { Dropdown } from "primereact/dropdown"
import { InputText } from "primereact/inputtext"
import { Message } from "primereact/message"
import { Password } from "primereact/password"
import { classNames } from "primereact/utils"
import { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { useAuth } from "../../contexts/authContext"
import { UserInfoModel } from "../../models/userInfoModel"
import { fetchServer } from "../../server"
import { USER_ROUTE } from "../../server/configs"

export type UserModalProps = {
    onSave(user: UserInfoModel): void
    displayUserModal: boolean
    setDisplayUserModal(display: boolean): void
    action: 'Insert' | 'Update'
    setAction(action: 'Insert' | 'Update'): void
    user: UserInfoModel | null
}

export function UserModal(props: UserModalProps) {
    const { userSession } = useAuth();
    const [textError, setTextError] = useState<string>('');
    const [modalText, setModalText] = useState<string>('');
    const [accessTypeOptions, setAccessTypeOptions] = useState<any[]>([]);
    const [method, setMethod] = useState<'POST' | 'GET' | 'PUT' | 'DELETE'>('POST');
    const [url, setUrl] = useState<string>('');
    const { handleSubmit, formState: { errors }, reset, control, setValue } = useForm<UserInfoModel>({
        defaultValues: {}
    });

    useEffect(() => {
        setAccessTypeOptions([
            { label: "Administrador", value: 0 },
            { label: "Usuário", value: 1 },
        ])

        if (props.action == 'Insert') {
            setMethod('POST');
            setUrl(`${USER_ROUTE}`);
            setModalText('Adicionar usuário');
            setValue('id', '');
            setValue('username', '');
            setValue('password', '');
            setValue('accessType', 1);
            setValue('createdAt', new Date());
            setValue('updatedAt', null);
        } else {
            setMethod('PUT');
            setUrl(`${USER_ROUTE}/${props.user?.id}`);
            setModalText('Alterar usuário');
            setValue('id', props.user?.id || '');
            setValue('username', props.user?.username || '');
            setValue('password', props.user?.password || '');
            setValue('accessType', props.user?.accessType == null ? 1 : props.user?.accessType);
            setValue('createdAt', props.user?.createdAt || new Date());
            setValue('updatedAt', props.user?.updatedAt || null);
        }
    }, [props.action]);

    async function onSubmit(userInfo: UserInfoModel) {
        fetchServer({
            route: url,
            method: method,
            user: userSession,
            body: JSON.stringify(userInfo)
        }).then(response => {
            if (response.error) {
                setTextError(response.error);
            } else {
                reset();
                setTextError('');
                props.onSave(response);
                props.setDisplayUserModal(false);
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
            header={modalText}
            visible={props.displayUserModal}
            modal breakpoints={{ '960px': '75vw' }}
            style={{ width: '40vw' }}
            onHide={() => {
                reset();
                props.setAction('Insert');
                props.setDisplayUserModal(false);
            }}>
            {textError ? <Message severity='error' text={textError} className='w-full mb-2' /> : <></>}
            <form onSubmit={handleSubmit(onSubmit)} className="formgrid grid p-fluid">
                <Controller name="id" control={control} render={({ field, fieldState }) => (
                    <InputText id={field.name} {...field} autoFocus hidden />
                )} />
                <Controller
                    name='username'
                    control={control}
                    rules={{ required: 'Usuário é obrigatório.' }}
                    render={({ field, fieldState }) => {
                        return (
                            <div className='field col-6 md:col-6'>
                                <label htmlFor={field.name} className={classNames({ 'p-error': errors.username })}>Usuário*</label>
                                <InputText id={field.name} {...field} className={classNames({ 'p-invalid': fieldState.error })} />
                                {getFormErrorMessage(field.name)}
                            </div>
                        );
                    }}
                />
                <Controller
                    name='password'
                    control={control}
                    rules={{ required: 'Senha é obrigatória.' }}
                    render={({ field, fieldState }) => {
                        return (
                            <div className='field col-6 md:col-6'>
                                <label htmlFor={field.name} className={classNames({ 'p-error': errors.password })}>Senha*</label>
                                <Password id={field.name} {...field}
                                    inputRef={field.ref} toggleMask
                                    feedback={false}
                                    className={classNames({ 'p-invalid': fieldState.error })}
                                    disabled={props.action == "Update"}
                                />
                                {getFormErrorMessage(field.name)}
                            </div>
                        );
                    }}
                />
                <Controller
                    name='accessType'
                    control={control}
                    render={({ field, fieldState }) => {
                        return (
                            <div className='field col-6 md:col-6'>
                                <label htmlFor={field.name}>Tipo de acesso</label>
                                <Dropdown id={field.name} {...field}
                                    options={accessTypeOptions}
                                    emptyMessage="Nenhum tipo de acesso encontrado"
                                    emptyFilterMessage="Nenhum tipo de acesso encontrado"
                                    placeholder="Selecione o tipo de acesso"
                                    onChange={(event) => {
                                        setValue("accessType", Number(event.value));
                                    }} />
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
                            props.setDisplayUserModal(false);
                        }} />
                    <Button
                        type="submit"
                        icon="pi pi-check"
                        label="Salvar"
                    />
                </div>
            </form>
        </Dialog>
    );
}