import * as path from 'path';

export const knex = require('knex')({
  client: 'sqlite3',
  connection: { filename: path.join(__dirname, '../../db.sqlite3') },
  useNullAsDefault: true
});

export default knex;
