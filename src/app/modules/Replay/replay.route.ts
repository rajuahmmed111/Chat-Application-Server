import express from 'express';
import { replayController } from './replay.controller';
import auth from '../../middleware/auth';
import { Role } from '@prisma/client';

const router = express.Router();

// send replay 
router.post('/send-message/:receiverId', auth(), replayController.sendReplay);

// get channels
router.get('/channels', auth(), replayController.getUserChannels);

// get all message
router.get('/get-message/:channelName', auth(), replayController.getMessages);

export const replayRoute = router;
