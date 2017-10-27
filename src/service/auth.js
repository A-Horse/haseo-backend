// @flow
import knex from './knex';
import bcrypt from 'bcryptjs';

function hashPassword(password: string) {
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);
  return hash;
}

export async function createUser(user: any, isAdmin: ?boolean) {
  const { username, password } = user;
  const hash = hashPassword(password);
  return await knex('user').insert({ username, password: hash, is_admin: isAdmin });
}

export async function authUser(cred: { username: string, password: string }) {
  const user = await knex('user').where({ username: cred.username })[0];
  if (!user) {
    throw Error('UserNotFound');
  }
  if (!bcrypt.compareSync(cred.password, user.password)) {
    throw Error('PasswordNotMatch');
  }
  return user;
}

export async function createAdmin() {
  const defaultPassword = 'admin';
  await createUser(
    {
      username: 'admin',
      password: hashPassword(defaultPassword)
    },
    true
  );
}

export async function checkHasAdmin() {
  const results = await knex('user')
    .where('username', '=', 'admin')
    .andWhere('isAdmin', '=', '1');
  return !!results.length;
}
