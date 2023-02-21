import { Button } from "primereact/button";
import { Menubar } from "primereact/menubar";
import { useEffect, useState } from "react";
import logo from "../../public/adritex_logo.png"
import { useAuth } from "../contexts/authContext";

export function Navbar() {
    const { userSession, logout } = useAuth();
    const [pages, setPages] = useState<any[]>([]);

    useEffect(() => {
        const json = localStorage.getItem('user');
        
        if(json) {
            const recoveredUser = JSON.parse(json);

            if (recoveredUser.accessType == 0) {
                setPages([
                    { label: "Home", icon: 'pi pi-home', command: () => window.location.href = "/", },
                    { label: "Clientes", icon: 'pi pi-user', command: () => window.location.href = "/clientes", },
                    { label: "Funcionários", icon: 'pi pi-users', command: () => window.location.href = "/funcionarios", },
                    {
                        label: "Pedidos", icon: 'pi pi-shopping-cart',
                        items: [
                            { label: "Produtos", command: () => window.location.href = "/pedidos/produtos", },
                            { label: "Ordem de produção", command: () => window.location.href = "/pedidos/ordens", },
                        ],
                    },
                    {
                        label: "Financeiro", icon: "pi pi-wallet",
                        items: [
                            { label: "Despesas", command: () => window.location.href = "/financeiro/despesas", },
                            { label: "Pagamentos", command: () => window.location.href = "/financeiro/pagamentos", }
                        ]
                    },
                    { label: "Dashboard", icon: "pi pi-chart-bar", command: () => window.location.href = "/dashboard", }
                ]);
            } else if (recoveredUser.accessType == 1) {
                setPages([
                    { label: "Home", icon: 'pi pi-home', command: () => window.location.href = "/", },
                    {
                        label: "Pedidos", icon: 'pi pi-shopping-cart',
                        items: [
                            { label: "Ordem de produção", command: () => window.location.href = "/pedidos/ordens", },
                        ],
                    },
                ]);
            } else {
                setPages([
                    { label: "Home", icon: 'pi pi-home', command: () => window.location.href = "/", },
                ]);
            }
        }
    }, []);

    async function onLogout(event: any) {
        try {
            logout();
        } catch (error) {
            throw error;
        }
    }

    const start = <img alt="logo" src={logo} height="40" className="mr-2"></img>;
    const end = <Button label="Sair" icon="pi pi-fw pi-power-off" className="p-button-outlined p-button-secondary" onClick={onLogout} />;

    return (
        userSession ? (<Menubar model={pages} start={start} end={end} />) : (<></>)
    )
}