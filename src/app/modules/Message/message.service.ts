import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiErrors';
import prisma from '../../../shared/prisma';

// send replay
const sendReplay = async (
  senderId: string,
  ticketId: string,
  message: string
) => {
  if (!senderId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: {
      user: {
        select: { id: true },
      },
    },
  });

  if (!ticket || !ticket.user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Receiver not found');
  }

  const receiverId = ticket.user.id;

  const [person1, person2] = [senderId, receiverId].sort();
  const channelName = person1 + person2;

  const [channel, newMessage] = await prisma.$transaction(
    async (prismaTransaction) => {
      let channel = await prismaTransaction.channel.findFirst({
        where: { channelName: channelName },
      });

      if (!channel) {
        channel = await prismaTransaction.channel.create({
          data: {
            channelName,
            person1Id: senderId,
            person2Id: receiverId,
          },
        });
      }

      //create message
      //  message created
      const newMessage = await prismaTransaction.replay.create({
        data: {
          message,
          senderId,
          channelName: channelName,
        },
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      return [channel, newMessage];
    }
  );

  //  all messages channel for the sender and receiver
  const allMessages = await prisma.channel.findMany({
    where: {
      channelName: channelName,
    },
    include: {
      replay: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return allMessages;
};

// get all messages
const getMessages = async (channelName: string) => {
  const message = await prisma.channel.findMany({
    where: {
      channelName: channelName,
    },
    select: {
      replay: {
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      },
    },
  });

  return message;
};

// get user channels
const getUserChannels = async (userId: string) => {
  const channels = await prisma.channel.findMany({
    where: {
      OR: [{ person1Id: userId }, { person2Id: userId }],
    },
    include: {
      person1: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          profileImage: true,
        },
      },
      person2: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          profileImage: true,
        },
      },
    },
  });
  return channels;
};

export const replayService = {
  sendReplay,
  getMessages,
  getUserChannels,
};
