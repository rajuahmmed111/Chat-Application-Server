


import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import { messageServices } from './message.service';
import sendResponse from '../../../shared/sendResponse';
import httpStatus from 'http-status';

const sendMessage = catchAsync(async (req: Request, res: Response) => {
  const senderId = req.user?.id;
  const receiverId = req.params.receiverId;
  const { message } = req.body;

  const files = req.files as
    | { [fieldname: string]: Express.Multer.File[] }
    | undefined;
  let imageUrls: string[] = [];
  if (files && files.messageImages) {
    imageUrls = files.messageImages.map((file: Express.Multer.File) => {
      const fileUrl = `${req.protocol}://${req.get('host')}/uploads/messages/${
        file.filename
      }`;
      return fileUrl;
    });
  }

  const result = await messageServices.sendMessage(
    senderId,
    receiverId,
    message,
    imageUrls
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Message send successfully',
    data: result,
  });
});

// get all messages

const getMessagesFromDB = catchAsync(async (req: Request, res: Response) => {
 const {channelName} = req.params
//  console.log(channelName);
 
  const messages = await messageServices.getMessagesFromDB(channelName);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Messages retrieved successfully',
    data: messages,
  });
});

const getUserChannels = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id
  // console.log(userId);
  
   const channels = await messageServices.getUserChannels(userId);
 
   sendResponse(res, {
     statusCode: httpStatus.OK,
     success: true,
     message: 'Messages retrieved successfully',
     data: channels,
   });
 });

export const messageControllers = {
  sendMessage,
  getMessagesFromDB,
  getUserChannels
};
