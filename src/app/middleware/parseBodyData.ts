import { NextFunction, Request, Response } from 'express';

export const parseBodyData = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.body.bodyData) {
    try {
      req.body = JSON.parse(req.body.bodyData);

      console.log('parseBodyData', req.body);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid JSON format in bodyData',
      });
    }
  }
  next();
};
