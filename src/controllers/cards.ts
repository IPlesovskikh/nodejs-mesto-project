import { NextFunction, Request, Response } from 'express';
import Card from '../models/card';
import NotFoundError from '../errors/notFoundError';
import BadRequestError from '../errors/badRequestError';

export const getCards = (req: Request, res: Response, next: NextFunction) => Card.find({})
  .then((cards) => res.send({ data: cards }))
  .catch(next);

export const deleteCard = (req: Request, res: Response, next: NextFunction) => {
  Card.findByIdAndDelete(req.params.cardId)
    .orFail(() => new NotFoundError('Карточка с указанным _id не найдена'))
    .then(() => res.send({ message: 'Карточка удалена' }))
    .catch((error) => {
      if (error.name === 'CastError') {
        return next(new BadRequestError('Передан несуществующий _id карточки'));
      }
      return next(error);
    });
};

export const createCard = (req: Request, res: Response, next: NextFunction) => {
  const { name, link } = req.body;
  const owner = req.user?._id;
  if (!name || !link || !owner) {
    return next(new BadRequestError('Переданы некорректные данные при создании карточки'));
  }
  return Card.create({ name, link, owner })
    .then((card) => res.send({ data: card }))
    .catch((error) => {
      if (error.name === 'CastError') {
        return next(new BadRequestError('Передан несуществующий _id карточки'));
      } if (error.name === 'ValidationError') {
        return next(new BadRequestError('Ошибка валидации полей'));
      }
      return next(error);
    });
};

export const likeCard = (req: Request, res: Response, next: NextFunction) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user?._id } },
    { new: true },
  )
    .orFail(() => new NotFoundError('Карточка с указанным _id не найдена'))
    .then((card) => {
      res.send({ data: card });
    })
    .catch((error) => {
      if (error.name === 'CastError') {
        return next(new BadRequestError('Передан несуществующий _id карточки'));
      }
      return next(error);
    });
};

export const dislikeCard = (req: Request, res: Response, next: NextFunction) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user?._id } },
    { new: true },
  )
    .orFail(() => new NotFoundError('Карточка с указанным _id не найдена'))
    .then((card) => {
      res.send({ data: card });
    })
    .catch((error) => {
      if (error.name === 'CastError') {
        return next(new BadRequestError('Передан несуществующий _id карточки'));
      }
      return next(error);
    });
};
