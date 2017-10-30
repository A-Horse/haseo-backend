// @flow
import knex from './knex';
import bcrypt from 'bcryptjs';
import configure from '../configure';
import jwt from 'jsonwebtoken';

export function signJwt(data) {
  return jwt.sign(
    {
      data,
      exp: Math.floor(Date.now() / 1000) + configure.JWT_EXP_HOURS * 60 * 60
    },
    configure.SERCET_KEY
  );
}

export function verityJwt(data) {
  return jwt.verify(data, configure.SERCET_KEY);
}

function hashPassword(password: string) {
  return bcrypt.hashSync(password, 10);
}

export async function createUser(user: any, isAdmin: ?boolean) {
  const { username, password } = user;
  const hash = hashPassword(password);
  return await knex('user').insert({
    username,
    password: hash,
    is_admin: isAdmin,
    created_date: new Date()
  });
}

export async function authUser(cred: { username: string, password: string }) {
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

export async function createAdmin() {
  const defaultPassword = 'admin';
  await createUser(
    {
      username: 'admin',
      password: defaultPassword
    },
    true
  );
}

export async function checkHasAdmin() {
  const results = await knex('user')
    .where('username', '=', 'admin')
    .andWhere('is_admin', '=', '1');
  return !!results.length;
}
