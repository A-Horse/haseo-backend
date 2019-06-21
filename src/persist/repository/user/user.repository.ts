

export interface UserRepository {
    createUser(user, isAdmin): Promise<void>;
    authUser(cred): Promise<any>;
    checkHasAdmin(): Promise<boolean>;
    createAdmin(password: string): Promise<void>; 
}
