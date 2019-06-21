export class TaskEvent {
    public type: string;
    public payload: any;

    constructor({
        type, payload
    }) {
        this.type = type;
        this.payload = payload
    }
}