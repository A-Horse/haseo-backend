import { UserRepository } from "./user.repository";

export class UserMemoryRepository implements UserRepository {
    public async createUser(user, isAdmin): Promise<void> {
       
    } 

    public async authUser(cred): Promise<void> {
        
    }

    public async checkHasAdmin(): Promise<boolean> {
       return Promise.resolve(true);
    }

    public async createAdmin(password: string): Promise<void> {
        
    }
}