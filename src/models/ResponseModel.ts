import { ChangeType } from "../enums/ChangeType";

export class ResponseModel<T> {
    action: ChangeType;
    data: T;

    constructor(action: ChangeType, data: T) {
        this.action = action;
        this.data = data;
    }
}