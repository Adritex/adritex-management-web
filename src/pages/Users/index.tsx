import { useEffect, useState, useRef } from "react";
import { useAuth } from "../../contexts/authContext";
import { fetchServer } from "../../server";
import { UserModel } from "../../models/userModel";
import { USER_ROUTE } from "../../server/configs";

import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { FilterMatchMode } from "primereact/api";
import { Toast } from 'primereact/toast';
import { DataTableHeader } from "../../components/DataTableHeader";
import { DeleteModal } from "../../components/modals/DeleteModal";
import { UserInfoModel } from "../../models/userInfoModel";
import { UserModal } from "../../components/modals/UserModal";
import { Button } from "primereact/button";
import { ChangeUserPasswordModal } from "../../components/modals/ChangeUserPasswordModal";

function UsersPage() {
    const toast = useRef<any>(null);
    const { userSession } = useAuth();
    const [displayDeleteModal, setDisplayDeleteModal] = useState<boolean>(false);

    const [displayUserModal, setDisplayUserModal] = useState<boolean>(false);
    const [action, setAction] = useState<'Insert' | 'Update'>('Insert');

    const [displayChangeUserPasswordModal, setDisplayChangeUserPasswordModal] = useState<boolean>(false);

    const [users, setUsers] = useState<UserInfoModel[]>([]);
    const [user, setUser] = useState<UserInfoModel | null>(null);
    const [selectedUsers, setSelectedUsers] = useState<UserInfoModel[]>([]);
    const [filters, setFilters] = useState({ "global": { value: null, matchMode: FilterMatchMode.CONTAINS } })
    const [globalFilterValue, setGlobalFilterValue] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchServer({
            route: USER_ROUTE,
            method: "GET",
            user: userSession,
        }).then(response => {
            setUsers(response);
            setLoading(false);
        });
    }, []);

    function renderDataTableHeader() {
        return (
            <DataTableHeader
                description="Usuários"
                filters={filters}
                setFilters={setFilters}
                selectedModels={selectedUsers}
                globalFilterValue={globalFilterValue}
                setGlobalFilterValue={setGlobalFilterValue}
                showExportButtons={false}
                onClickExportPDF={() => { }}
                onClickExportXLS={() => { }}
                onClickNewItem={() => {
                    setUser(null);
                    setAction('Insert');
                    setDisplayUserModal(true);
                }}
                onClickUpdateItem={() => {
                    var selectedUser = UserInfoModel.clone(selectedUsers[0]);
                    selectedUser.updatedAt = new Date();
                    setUser(selectedUser);
                    setAction('Update');
                    setDisplayUserModal(true);
                }}
                onClickDeleteItem={() => {
                    setDisplayDeleteModal(true);
                }}
                otherButtons={() => {
                    return (
                        <>
                            <Button
                                label="Alterar senha"
                                icon="pi pi-wrench"
                                disabled={!(selectedUsers.length == 1)}
                                onClick={() => {
                                    var selectedUser = UserInfoModel.clone(selectedUsers[0]);
                                    setUser(selectedUser);
                                    setDisplayChangeUserPasswordModal(true);
                                }}
                            />
                        </>
                    )
                }}
            />
        );
    }

    function onSave(user: UserInfoModel) {
        const filteredUsers = users.filter(item => item.id != user.id)

        setSelectedUsers([]);
        setUsers([...filteredUsers, user]);

        toast.current.show({
            severity: 'success',
            summary: 'Sucesso!',
            detail: 'O usuário foi salvo com sucesso!',
            life: 3000
        });
    }

    async function onPasswordChanged(user: UserInfoModel) {
        toast.current.show({
            severity: 'success',
            summary: 'Sucesso!',
            detail: 'Senha do usuário foi alterada com sucesso!',
            life: 3000
        });
    }

    function onDelete(selectedUsers: UserInfoModel[]) {
        const ids: string[] = selectedUsers.map(item => item.id);

        if (ids.length > 0) {
            fetchServer({
                route: USER_ROUTE,
                method: "DELETE",
                user: userSession,
                body: JSON.stringify({ ids })
            }).then(() => {
                const filteredProducts = users.filter(
                    item => !ids.includes(item.id)
                );

                setUsers(filteredProducts);

                toast.current.show({
                    severity: 'success',
                    summary: 'Sucesso!',
                    detail: 'Os usuário selecionados foram removidos com sucesso!',
                    life: 3000
                });
            });
        }
    }

    function createdAtBodyTemplate(rowData: any) {
        return formatDate(rowData.createdAt);
    }

    function updatedAtBodyTemplate(rowData: any) {
        return formatDate(rowData.updatedAt);
    }

    function formatDate(value: any) {
        if (value && value != "Invalid Date") {
            return new Date(value).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            });
        }
    }

    return (
        <>
            <Toast ref={toast} />
            <div className="datatable">
                <div className="datatable card">
                    <DataTable value={users} paginator className="p-datatable" header={renderDataTableHeader()} rows={10}
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown" rowsPerPageOptions={[5, 10, 25]}
                        dataKey="id" rowHover selection={selectedUsers} onSelectionChange={e => setSelectedUsers(e.value)}
                        filters={filters} filterDisplay="menu" loading={loading} responsiveLayout="scroll"
                        globalFilterFields={['username']} emptyMessage="Nenhum usuário encontrado."
                        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} entradas">
                        <Column selectionMode="multiple" headerStyle={{ width: '3em' }}></Column>
                        <Column field="username" header="Usuário" sortable style={{ minWidth: '14rem' }} />
                        <Column field="createdAt" header="Criado em" sortable style={{ minWidth: '14rem' }} body={createdAtBodyTemplate} />
                        <Column field="updatedAt" header="Atualizado em" sortable style={{ minWidth: '14rem' }} body={updatedAtBodyTemplate} />
                    </DataTable>
                </div>
            </div>

            <UserModal
                displayUserModal={displayUserModal}
                setDisplayUserModal={setDisplayUserModal}
                user={user}
                onSave={onSave}
                action={action}
                setAction={setAction}
            />

            <ChangeUserPasswordModal
                displayChangeUserPasswordModal={displayChangeUserPasswordModal}
                setDisplayChangeUserPasswordModal={setDisplayChangeUserPasswordModal}
                user={user}
                onPasswordChanged={onPasswordChanged}
            />

            <DeleteModal
                models={selectedUsers}
                deleteModalDescription={"Deseja realmente remover os usuários selecionados?"}
                deleteModalHeader={"Excluir"}
                displayDeleteModal={displayDeleteModal}
                setDisplayDeleteModal={setDisplayDeleteModal}
                onClickDelete={onDelete}
            />
        </>
    );
}

export default UsersPage;