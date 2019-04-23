import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';
import knex from './knex';
import configure from '../configure';

export function signJwt(data) {
  return jwt.sign(
    {
      data,
      exp: Math.floor(Date.now() / 1000) + configure['JWT_EXP_HOURS'] * 60 * 60
    },
    configure['SERCET_KEY']
  );
}

export function verityJwt(data: string): { data: User; exp: number } {
  return jwt.verify(data, configure['SERCET_KEY']);
}

// export async function createUser(user, isAdmin) {
//   const { username, password } = user;
//   const hash = hashPassword(password);
//   return await knex('user').insert({
//     username,
//     password: hash,
//     is_admin: isAdmin,
//     created_date: new Date()
//   });
// }

// export async function authUser(cred) {
//   const user = (await knex('user')
//     .select('*')
//     .where({ username: cred.username }))[0];
//   if (!user) {
//     throw Error('UserNotFound');
//   }
//   if (!bcrypt.compareSync(cred.password, user.password)) {
//     throw Error('PasswordNotMatch');
//   }
//   return user;
// }

// export async function createAdmin(password: string) {
//   if (!password) {
//     throw new Error('You must provide a password');
//   }
//   await createUser(
//     {
//       username: 'admin',
//       password
//     },
//     true
//   );
// }

// export async function checkHasAdmin() {
//   const results = await knex('user')
//     .where('username', '=', 'admin')
//     .andWhere('is_admin', '=', '1');
//   return !!results.length;
// }
