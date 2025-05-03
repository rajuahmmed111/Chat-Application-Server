
import { Router } from 'express';
import { messageControllers } from './message.controller';
import auth from '../../middleware/auth';
import { fileUploader } from '../../../helpers/fileUploader';
import { parseBodyData } from '../../middleware/parseBodyData';

const router = Router();

// send message
router.post(
  '/send-message/:receiverId',
  auth(),
  //   fileUploader.uploadMessageImages,
  parseBodyData,
  messageControllers.sendMessage
);

router.get('/channels', auth(), messageControllers.getUserChannels);

// get all message
router.get(
  '/get-message/:channelName',
  auth(),
  messageControllers.getMessagesFromDB
);

export const messageRoutes = router;
