import express from 'express';
import R from 'ramda';
import { validate } from '../router-middle/validate';
import knex from '../service/knex';
import { createUser, authUser } from '../service/auth';

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
      const authedUser = authUser(cred);
      return res.json(authedUser);
    } catch (error) {
      next(error);
    }
  }
);

export default UserRouter;
