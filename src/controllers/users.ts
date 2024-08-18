import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import User from '../models/user';
import NotFoundError from '../errors/notFoundError';
import BadRequestError from '../errors/badRequestError';

export const getUsers = (req: Request, res: Response, next: NextFunction) => User.find({})
  .then((users) => res.send({ data: users }))
  .catch(next);

export const createUser = (req: Request, res: Response, next: NextFunction) => {
  const { name, about, avatar } = req.body;

  return User.create({ name, about, avatar })
    .then((user) => res.send({ data: user }))
    .catch((error) => {
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
