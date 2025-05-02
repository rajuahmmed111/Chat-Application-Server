// routes/channel.routes.ts
import express from 'express';
import auth from '../../middleware/auth';

const router = express.Router();

// Channel routes
router.post('/', auth(), ChannelController.createChannel);
router.get('/', auth(), ChannelController.getUserChannels);
router.get('/:channelId', auth(), ChannelController.getChannelById);
router.post('/:channelId/members', auth(), ChannelController.addChannelMember);
router.delete('/:channelId/members/:userId', auth(), ChannelController.removeChannelMember);
router.get('/:channelId/messages', auth(), ChannelController.getChannelMessages);

export const channelRoutes = router;