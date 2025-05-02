import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { replayService } from './message.service';

// create channel 
const createChannel = catchAsync(async (req, res) => {
  const userId = req.user?.id;
  const { name, type, memberIds } = req.body;

  const channel = await ChannelService.createChannel({
    name,
    type,
    memberIds: allMemberIds,
    creatorId: userId
  });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Replay sent successfully',
    data: result,
  });
});

// get all messages
const getMessages = catchAsync(async (req, res) => {
  const { channelName } = req.params;
  //  console.log(channelName);

  const messages = await replayService.getMessages(channelName);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Messages retrieved successfully',
    data: messages,
  });
});

// get channels
const getUserChannels = catchAsync(async (req, res) => {
  const userId = req.user?.id;
  // console.log(userId);

  const channels = await replayService.getUserChannels(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Messages retrieved successfully',
    data: channels,
  });
});

export const replayController = {
  sendReplay,
  getMessages,
  getUserChannels,
};
