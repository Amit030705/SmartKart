import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';

export const generateToken = (userId, res) => {
  const token = jwt.sign({ id: userId }, ENV.JWT_SECRET, {
    expiresIn: ENV.JWT_EXPIRES_IN,
  });

  const cookieOptions = {
    httpOnly: true,
    secure: ENV.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  res.cookie('jwt', token, cookieOptions);
  return token;
};

export const clearToken = (res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
    sameSite: 'lax',
    secure: ENV.NODE_ENV === 'production',
  });
};
