import express, { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import userRouter from './routes/users';
import cardRouter from './routes/cards';
import errorHandler from './errors/errorHandler';
import NotFoundError from './errors/notFoundError';

const { PORT = 3000 } = process.env;

const app = express();

mongoose.connect('mongodb://127.0.0.1:27017/mestodb');

app.use(express.json());

declare global {
  namespace Express {
    interface Request {
      user?: { _id: mongoose.Types.ObjectId }; // Определение нового свойства user для мидлвара-заглушки
    }
  }
}

app.use((req: Request, res: Response, next: NextFunction) => {
  req.user = {
    _id: new mongoose.Types.ObjectId('666d7a229bf4994b29cfa4dd'),
  };

  next();
});

app.use('/users', userRouter);
app.use('/cards', cardRouter);
app.use('*', (req: Request, res: Response, next: NextFunction) => {
  next(new NotFoundError('Страница с таким url не найдена.'));
}); app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
