import * as express from 'express';
import * as R from 'ramda';
import { validate } from '../router-middle/validate';
import knex from '../service/knex';
import { createUser, authUser, signJwt } from '../service/auth';

const UserRouter = express.Router();

UserRouter.post('/logout', (req, res) => {
  res.status(204).send();
});

UserRouter.post(
  '/signin',
  validate({
    username: ['required'],
    password: ['required']
  }),
  async (req, res, next) => {
    try {
      const { username, password } = req.body;
      const cred = {
        username: username.trim(),
        password: password.trim()
      };
      const authedUser = await authUser(cred);
      const userWithoutPassword = R.omit('password', authedUser);
      const jwtToken = signJwt(userWithoutPassword);
      return res.header({ jwt: jwtToken }).json(userWithoutPassword);
    } catch (error) {
      switch (error.message) {
        case 'UserNotFound':
        case 'PasswordNotMatch':
          res.status(401).send();
          break;
        default:
          next(error);
          break;
      }
    }
  }
);

export default UserRouter;
