export class UserModel {
    username: string;
    password: string;
    token: string;

    constructor(username: string, password: string) {
        this.username = username;
        this.password = password;
        this.token = "";
    }

    static empty() {
        return new UserModel("", "");
    }
} 