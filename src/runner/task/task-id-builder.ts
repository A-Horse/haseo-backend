import * as uuid from 'uuid/v1';

export class TaskIdBuilder {
    constructor() {}
    
    public generateId(): string {
        return uuid();
    }
}