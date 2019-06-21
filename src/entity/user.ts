export interface IUser {
    id: string;
    username: string;
}

// TODO move
export class User {
    public id: string;
    public username: string;

    constructor(userData: IUser) {
        this.id = userData.id;
        this.username = userData.username;
    }

    public json(): IUser {
        return {
            id: this.id,
            username: this.username
        };
    }

}