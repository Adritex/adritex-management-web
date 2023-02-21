
import { useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { UserModel } from '../../models/userModel';

import { Image } from 'primereact/image';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { classNames } from 'primereact/utils';
import { Toast } from 'primereact/toast';
import { useAuth } from '../../contexts/authContext';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
    const navigate = useNavigate();
    const { login, userSession } = useAuth();
    const toast = useRef<Toast>(null);
    const { handleSubmit, formState: { errors }, reset, control } = useForm<UserModel>({
        defaultValues: { username: '', password: '' }
    });

    if(userSession) {
        navigate('/');
    }

    async function onSubmit(user: UserModel) {
        try {
            await login(user);
            reset();
        } catch (error: Error | any) {
            toast.current?.show({
                severity: 'error',
                summary: 'Erro',
                detail: error.message,
                life: 3000
            });
        }
    }

    function getFormErrorMessage(property: string) {
        const keyof = property as keyof UserModel;

        if (errors[keyof]) {
            return <small className='p-error'>{errors[keyof]?.message}</small>
        }
    }

    return (
        <div className='form-demo h-screen'>
            <Toast ref={toast} />
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
                            <Controller 
                                name='username'
                                control={control}
                                rules={{required: 'Usuário é obrigatório.'}}
                                render={({field, fieldState}) => {
                                    return (
                                        <div className='field'>
                                            <label htmlFor={field.name} className={classNames({ 'p-error': errors.username })}>Usuário</label>
                                            <InputText id={field.name} {...field} className={classNames({ 'p-invalid': fieldState.error  })} onChange={(e) => field.onChange(e.target.value)}/>
                                            {getFormErrorMessage(field.name)}
                                        </div>
                                    );
                                }}
                            />  
                            <Controller 
                                name='password'
                                control={control}
                                rules={{required: 'Senha é obrigatória.'}}
                                render={({field, fieldState}) => {
                                    return (
                                        <div className='field'>
                                            <label htmlFor={field.name} className={classNames({ 'p-error': errors.password })}>Senha</label>
                                            <Password id={field.name} {...field} inputRef={field.ref} toggleMask feedback={false} className={classNames({ 'p-invalid': fieldState.error  })} />
                                            {getFormErrorMessage(field.name)}
                                        </div>
                                    );
                                }}
                            />

                            <Button type="submit" label="Acessar" className="mt-2" />
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default LoginPage;