import { NextFunction, Request, Response } from 'express';
import User from '../models/user';
import NotFoundError from '../errors/notFoundError';
import mongoose, { Error as MongooseError } from 'mongoose';
import BadRequestError from '../errors/badRequestError';

export const getUsers = (req: Request, res: Response, next: NextFunction) => User.find({})
  .then((users) => res.send({ data: users }))
  .catch(next);

export const createUser = (req: Request, res: Response, next: NextFunction) => {
  const { name, about, avatar } = req.body;

  if (!name || !about || !avatar) {
    return next(new BadRequestError('Переданы некорректные данные при создании пользователя'));
  }
  return User.create({ name, about, avatar })
    .then((user) => res.send({ data: user }))
    .catch(next);
};

export const getOneUser = (req: Request, res: Response, next: NextFunction) => {
  const ObjectId = mongoose.Types.ObjectId;
  const userId = new ObjectId(req.params.userId);

  User.findById(userId)
  .orFail(new NotFoundError('Пользователь по указанному _id не найден'))
  .then((user) => {
      res.send({ data: user });
  })
  .catch((error) => {
    if (error.name == "CastError") {
      return next(new BadRequestError('Передан некорректный _id пользователя'));
    } else {
      return next(error);
    }
  });
};

export const updateProfile = (req: Request, res: Response, next: NextFunction) => {
  const { name, about } = req.body;
  const ObjectId = mongoose.Types.ObjectId;
  const userId = new ObjectId(req.params.userId);

  if (!name || !about) {
    return next(new BadRequestError('Переданы некорректные данные при обновлении профиля'));
  }
  return User.findByIdAndUpdate(req.user?._id, { name, about }, { new: true })
    .then((user) => {
        res.send({ data: user });
    })
    .catch((error) => {
      if (error.name == "CastError") {
        return next(new BadRequestError('Передан некорректный _id пользователя.'));
      } else if (error instanceof NotFoundError) {
        return next(new NotFoundError('Пользователь по указанному _id не найден'));
      } else {
        return next(error);
      }
    });
};

export const updateAvatar = (req: Request, res: Response, next: NextFunction) => {
  const { avatar } = req.body;
  if (!avatar) {
    return res.status(400).json({ message: 'Переданы некорректные данные при обновлении аватара' });
  }
  return User.findByIdAndUpdate(req.user?._id, { avatar }, { new: true })
    .then((user) => {
      res.send({ data: user });
    })
    .catch((error) => {
      if (error.name == "CastError") {
        return next(new BadRequestError('Передан некорректный _id пользователя'));
      } else if (error instanceof NotFoundError) {
        return next(new NotFoundError('Пользователь по указанному _id не найден'));
      } else {
        return next(error);
      }
    });
};