import { NextFunction } from 'express';
import NotFoundError from './notFoundError';

const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  next(new NotFoundError('The requested resource is not found'));
};

export default notFoundHandler;
