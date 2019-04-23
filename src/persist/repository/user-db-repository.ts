
import * as jwt from 'jsonwebtoken';
import knex from '../../service/knex';
import * as bcrypt from 'bcryptjs';
import { UserRepository } from './user-repository';

function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}
  
export class UserDBRepository implements UserRepository {
    public async createUser(user, isAdmin): Promise<void> {
        const { username, password } = user;
            const hash = hashPassword(password);
            return await knex('user').insert({
              username,
              password: hash,
              is_admin: isAdmin,
              created_date: new Date()
            });
    } 

    public async authUser(cred): Promise<void> {
        const user = (await knex('user')
        .select('*')
        .where({ username: cred.username }))[0];
        if (!user) {
        throw Error('UserNotFound');
        }
        if (!bcrypt.compareSync(cred.password, user.password)) {
        throw Error('PasswordNotMatch');
        }
        return user;
    }

    public async checkHasAdmin(): Promise<boolean> {
        const results = await knex('user')
        .where('username', '=', 'admin')
        .andWhere('is_admin', '=', '1');
      return !!results.length;
    }

    public async createAdmin(password: string): Promise<void> {
        if (!password) {
          throw new Error('You must provide a password');
        }
        await this.createUser(
          {
            username: 'admin',
            password
          },
          true
        );
      }
}