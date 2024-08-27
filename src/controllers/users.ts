import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import UnAuthError from '../errors/unAuthError';
import ConflictError from '../errors/conflictError';
import BadRequestError from '../errors/badRequestError';
import NotFoundError from '../errors/notFoundError';
import User from '../models/user';

export const getUsers = (req: Request, res: Response, next: NextFunction) => User.find({})
  .then((users) => res.send({ data: users }))
  .catch(next);

export const createUser = (req: Request, res: Response, next: NextFunction) => {
  const {
    name, about, avatar, email, password,
  } = req.body;

  return bcrypt.hash(password, 10)
    .then((hashedPassword: string) => User.create({
      name,
      about,
      avatar,
      email,
      password: hashedPassword,
    }))
    .then((user) => res.send({ data: user }))
    .catch((error) => {
      if (error.code === 11000) {
        return next(new ConflictError('Пользователь уже существует'));
      }
      if (error.name === 'ValidationError') {
        return next(new BadRequestError('Переданы некорректные данные для создания профиля'));
      }
      return next(error);
    });
};

export const getOneUser = (req: Request, res: Response, next: NextFunction) => {
  const { ObjectId } = mongoose.Types;
  const userId = new ObjectId(req.params.userId);

  User.findById(userId)
    .orFail(() => new NotFoundError('Карточка с указанным _id не найдена'))
    .then((user) => {
      res.send({ data: user });
    })
    .catch((error) => {
      if (error.name === 'CastError') {
        return next(new BadRequestError('Передан некорректный _id пользователя'));
      }
      return next(error);
    });
};

export const updateProfile = (req: Request, res: Response, next: NextFunction) => {
  const { name, about } = req.body;

  return User.findByIdAndUpdate(req.user?._id, { name, about }, { new: true, runValidators: true })
    .orFail(() => new NotFoundError('Профиль не найден'))
    .then((user) => {
      res.send({ data: user });
    })
    .catch((error) => {
      if (error.name === 'CastError') {
        return next(new BadRequestError('Передан некорректный _id пользователя.'));
      } if (error instanceof NotFoundError) {
        return next(new NotFoundError('Пользователь по указанному _id не найден'));
      } if (error.name === 'ValidationError') {
        return next(new BadRequestError('Переданы некорректные данные при обновлении профиля'));
      }
      return next(error);
    });
};

export const updateAvatar = (req: Request, res: Response, next: NextFunction) => {
  const { avatar } = req.body;

  return User.findByIdAndUpdate(req.user?._id, { avatar }, { new: true, runValidators: true })
    .orFail(() => new NotFoundError('Карточка с указанным _id не найдена'))
    .then((user) => {
      res.send({ data: user });
    })
    .catch((error) => {
      if (error.name === 'CastError') {
        return next(new BadRequestError('Передан некорректный _id пользователя'));
      } if (error instanceof NotFoundError) {
        return next(new NotFoundError('Пользователь по указанному _id не найден'));
      } if (error.name === 'ValidationError') {
        return next(new BadRequestError('Переданы некорректные данные при обновлении аватара'));
      }
      return next(error);
    });
};

export const login = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  User.findOne({ email })
    .select('+password')
    .then((user) => {
      if (!user || !bcrypt.compareSync(password, user.password)) {
        throw new UnAuthError('Неправильные почта или пароль');
      }
      const { _id } = user;
      const token = jwt.sign({ _id }, 'private-key', { expiresIn: '7d' });
      res.send({ token });
    })
    .catch(next);
};

export const getCurrentUser = (
  req: Request,
  res: Response,
  next: NextFunction,
) => User.findById(req.user?._id)
  .orFail(() => {
    throw new NotFoundError('Пользователь по указанному id не найден.');
  })
  .then((user) => res.send({ user }))
  .catch(next);
