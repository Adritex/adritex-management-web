
import { useEffect, useState, useContext } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { UserModel } from '../../models/userModel';
import { AuthContext } from '../../contexts/authContext';

import { Image } from 'primereact/image';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { classNames } from 'primereact/utils';

function LoginPage() {
    const { user, login } = useContext(AuthContext);
    const [formData, setFormData] = useState({});
    const defaultValues = UserModel.empty();
    const { control, formState: { errors }, handleSubmit, reset } = useForm({ defaultValues });

    async function onSubmit(user: UserModel) {
        try {
            setFormData(user);
            login(user);
            reset();
        } catch (error) {
            throw error;
        }
    }

    function getFormErrorMessage(property: string) {
        if (errors[property as keyof UserModel]) {
            return (
                <small className='p-error'>
                    {errors[property as keyof UserModel]?.message + ""}
                </small>
            );
        }
    }

    return (
        <div className='form-demo h-screen'>
            <div className='flex h-screen align-items-center justify-content-center'>
                <div className='card'>
                    <Card>
                        <div className="flex align-items-center justify-content-center">
                            <Image alt="logo" src={"/adritex_logo.png"} height="80" className="mr-2" />
                        </div>
                        <p className="mt-2 text-center text-sm text-gray-600">
                            Acesse o sistema utilizando suas credenciais configurada pelo administrador!
                        </p>
                        <form onSubmit={handleSubmit(onSubmit)} className='p-fluid'>
                            <div className='field'>
                                <span className='p-float-label p-input-icon-right'>
                                    <i className="pi pi-user" />
                                    <Controller name="username" control={control} rules={{ required: 'Campo obrigatório.' }} render={({ field, fieldState }) => (
                                        <InputText id={field.name} {...field} className={classNames({ 'p-invalid': fieldState.invalid })} />
                                    )} />
                                    <label htmlFor="username" className={classNames({ 'p-error': !!errors.username })}>Usuário*</label>
                                </span>
                                {getFormErrorMessage('username')}
                            </div>
                            <div className="field">
                                <span className="p-float-label">
                                    <Controller name="password" control={control} rules={{ required: 'Campo obrigatório.' }} render={({ field, fieldState }) => (
                                        <Password id={field.name} {...field} toggleMask feedback={false} className={classNames({ 'p-invalid': fieldState.invalid })} />
                                    )} />
                                    <label htmlFor="password" className={classNames({ 'p-error': errors.password })}>Senha*</label>
                                </span>
                                {getFormErrorMessage('password')}
                            </div>

                            <Button type="submit" label="Acessar" className="mt-2" />
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default LoginPage;