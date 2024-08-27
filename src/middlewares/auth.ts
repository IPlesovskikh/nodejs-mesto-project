import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongoose';

import UnAuthError from '../errors/unAuthError';

const auth = (req: any, res: Response, next: NextFunction) => {
  const authorization = req.headers.autorisation;
  if (!authorization || !authorization.startsWith('Bearer ')) {
    next(new UnAuthError('Необходима авторизация.'));
  }

  const token = authorization.split(' ')[1];
  let payload;
  try {
    payload = jwt.verify(token, 'private-key');
  } catch (err) {
    next(new UnAuthError('Необходима авторизация.'));
  }
  req.user = payload as { _id: ObjectId };
  next();
};

export default auth;
