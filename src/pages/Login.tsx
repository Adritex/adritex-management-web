import { useEffect, useState } from "react";
import { useForm, Controller } from 'react-hook-form';

import { Image } from 'primereact/image';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { classNames } from 'primereact/utils';

export function Login() {
    // const router = useRouter();
    // const { user, login } = useAuth();
    // const [formData, setFormData] = useState({});
    // const defaultValues = CredentialsModel.empty();
    // const { control, formState: { errors }, handleSubmit, reset } = useForm({ defaultValues });

    // useEffect(() => {
    //     if (user) {
    //         router.push("/");
    //     }
    // }, [router, user])

    // const onSubmit = async (data: CredentialsModel) => {
    //     try {
    //         setFormData(data);
    //         await login(data);
    //         reset();
    //         router.push("/");
    //     } catch (error) {
    //         throw error;
    //     }
    // };

    // function getFormErrorMessage(name: string) {
    //     if (errors[name as keyof CredentialsModel]) {
    //         return <small className="p-error">{errors[name as keyof CredentialsModel]?.message}</small>
    //     }
    // };

    // return (
    //     user ? (<></>) : (
    //         <div className="form-demo h-screen">
    //             <div className="flex h-screen align-items-center justify-content-center">
    //                 <div className="card">
    //                     <Card>
    //                         <div className="flex align-items-center justify-content-center">
    //                             <Image alt="logo" src={"/adritex_logo.png"} height="80" className="mr-2" />
    //                         </div>
    //                         <p className="mt-2 text-center text-sm text-gray-600">
    //                             Acesse o sistema utilizando sua conta de email configurada pelo administrador!
    //                         </p>
    //                         <form onSubmit={handleSubmit(onSubmit)} className="p-fluid">
    //                             <div className="field">
    //                                 <span className="p-float-label p-input-icon-right">
    //                                     <i className="pi pi-envelope" />
    //                                     <Controller name="email" control={control}
    //                                         rules={{ required: 'Email é obrigatório.', pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i, message: 'Endereço de email inválido. Exemplo: example@email.com' } }}
    //                                         render={({ field, fieldState }) => (
    //                                             <InputText id={field.name} {...field} className={classNames({ 'p-invalid': fieldState.invalid })} />
    //                                         )} />
    //                                     <label htmlFor="email" className={classNames({ 'p-error': !!errors.email })}>Email*</label>
    //                                 </span>
    //                                 {getFormErrorMessage('email')}
    //                             </div>
    //                             <div className="field">
    //                                 <span className="p-float-label">
    //                                     <Controller name="password" control={control} rules={{ required: 'Senha é obrigatória.' }} render={({ field, fieldState }) => (
    //                                         <Password id={field.name} {...field} toggleMask feedback={false} className={classNames({ 'p-invalid': fieldState.invalid })} />
    //                                     )} />
    //                                     <label htmlFor="password" className={classNames({ 'p-error': errors.password })}>Password*</label>
    //                                 </span>
    //                                 {getFormErrorMessage('password')}
    //                             </div>

    //                             <Button type="submit" label="Acessar" className="mt-2" />
    //                         </form>
    //                     </Card>
    //                 </div>
    //             </div>
    //         </div>
    //     )
    // );
    return (
        <>Login</>
    )
}