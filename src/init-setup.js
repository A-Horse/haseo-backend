import knex from './service/knex';
import { checkHasAdmin } from './service/auth';

if (!checkHasAdmin()) {
  console.log('admin');
  createAdmin();
}
