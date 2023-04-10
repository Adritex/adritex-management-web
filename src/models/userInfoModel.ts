export class UserInfoModel {
    id: string;
    username: string;
    password: string;
    accessType: number;
    createdAt: Date;
    updatedAt: Date | null;

    constructor(id: string, username: string, password: string, accessType: number, createAt: Date, updateAt: Date | null){
        this.id = id;
        this.username = username;
        this.password = password;
        this.accessType = accessType;
        this.createdAt = createAt;
        this.updatedAt = updateAt;
    }

    static clone(userInfo: UserInfoModel) {
        return new UserInfoModel(
            userInfo.id,
            userInfo.username,
            userInfo.password,
            userInfo.accessType,
            userInfo.createdAt,
            userInfo.updatedAt
        );
    }
}