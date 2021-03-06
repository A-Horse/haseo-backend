import * as express from 'express';
import * as R from 'ramda';
import { validate } from '../router-middle/validate';
import { signJwt } from '../../service/auth';
import * as camelcaseKeys from 'camelcase-keys';
import { verityJwt } from '../../service/auth';
import { User } from '../../entity/user';
import { userRepository } from '../../persist/repository/user';

const UserRouter = express.Router();

UserRouter.post('/logout', (req, res) => {
  res.status(204).send();
});

UserRouter.get('/self-info', async (req, res, next) => {
  const jwt = req.get('jwt');
  try {
    const user: User = verityJwt(jwt);
    res.send(camelcaseKeys(user));
  } catch (error) {
    res.status(401).send();
  }
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
      const authedUser = await userRepository.authUser(cred);
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
