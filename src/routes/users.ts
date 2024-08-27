import { Router } from 'express';
import Joi from 'joi';
import { celebrate } from 'celebrate';
import {
  getUsers, getOneUser, updateProfile, updateAvatar, getCurrentUser,
} from '../controllers/users';

const router = Router();

router.get('/', getUsers);
router.get('/:userId', celebrate({
  params: Joi.object().keys({
    userId: Joi.string().required().hex().length(24),
  }),
}), getOneUser);
router.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
  }),
}), updateProfile);
router.patch('/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().required().pattern(/^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w.-]+)+[\w\-._~:/?#[\]@!$&'()*+,;=.]+$/),
  }),
}), updateAvatar);
router.get('/me', getCurrentUser);

export default router;
