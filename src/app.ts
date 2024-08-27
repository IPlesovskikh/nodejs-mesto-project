import express, { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { celebrate, Joi, errors } from 'celebrate';
import { login, createUser } from './controllers/users';
import auth from './middlewares/auth';
import { errLogger, reqLogger } from './middlewares/logger';
import userRouter from './routes/users';
import cardRouter from './routes/cards';
import errorHandler from './middlewares/errorHandler';
import NotFoundError from './errors/notFoundError';

const { PORT = 3000 } = process.env;

const app = express();

mongoose.connect('mongodb://127.0.0.1:27017/mestodb');

app.use(express.json());

declare global {
  namespace Express {
    interface Request {
      user?: { _id: mongoose.Types.ObjectId };
    }
  }
}

app.use(reqLogger);

app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), login);
app.post('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().required().pattern(/^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w.-]+)+[\w\-._~:/?#[\]@!$&'()*+,;=.]+$/),
  }),
}), createUser);

app.use(auth);
app.use('/users', userRouter);
app.use('/cards', cardRouter);
app.use('*', (req: Request, res: Response, next: NextFunction) => {
  next(new NotFoundError('Страница с таким url не найдена.'));
});

app.use(errLogger);
app.use(errors());
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
