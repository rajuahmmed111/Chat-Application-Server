// import { Server } from 'http';
// import { WebSocketServer, WebSocket } from 'ws';
// import { PrismaClient } from '@prisma/client';
// import config from './config';
// import app from './app';
// // import { privateMessageService } from "./app/modules/privateMessage/privateMessage.service";

// const prisma = new PrismaClient();
// let wss: WebSocketServer;
// const channelClients = new Map<string, Set<WebSocket>>();

// function broadcastToChannel(
//   channelId: string,
//   data: object,
//   excludeSocket: WebSocket | null = null
// ) {
//   const clients = channelClients.get(channelId);
//   if (clients) {
//     clients.forEach((client) => {
//       if (excludeSocket !== client && client.readyState === WebSocket.OPEN) {
//         client.send(JSON.stringify(data));
//       }
//     });
//   }
// }

// async function main() {
//   const server: Server = app.listen(config.port, () => {
//     console.log('Server running on port', config.port);
//   });

//   // new WebSocket server
//   wss = new WebSocketServer({ server });

//   // client handle connection
//   wss.on('connection', (ws) => {
//     console.log('New WebSocket connection!');

//     let channelId: string | null = null;
//     // client received message
//     ws.on('message', async (message) => {
//       try {
//         const parsed = JSON.parse(message.toString());
//         if (parsed.type === 'subscribe' && parsed.channelId) {
//           channelId = parsed.channelId;

//           if (channelId && !channelClients.has(channelId)) {
//             channelClients.set(channelId, new Set());
//           }
//           channelId && channelClients.get(channelId)?.add(ws);
//           ws.send(JSON.stringify({ type: 'subscribed', channelId }));
//         } else if (parsed.type === 'message') {
//           const channelId = parsed.channelId;
//           const privateMessage = parsed.message;
//           broadcastToChannel(channelId, privateMessage);
//         }
//         // else if (
//         //   parsed.type === "offer" ||
//         //   parsed.type === "answer" ||
//         //   parsed.type === "candidate"
//         // ) {
//         //   broadcastToChannel(parsed.channelName, parsed, ws);
//         // }
//       } catch (err: any) {
//         console.error('error:', err.message);
//       }
//     });
//     ws.on('close', () => {
//       if (channelId) {
//         channelClients.get(channelId)?.delete(ws);
//         if (channelClients.get(channelId)?.size === 0) {
//           channelClients.delete(channelId);
//         }
//       }
//       console.log('Client disconnected!');
//     });
//   });
// }

// main();



// update server
import { Server } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { PrismaClient } from '@prisma/client';
import config from './config';
import app from './app';
import { ObjectId } from 'mongodb'; // Add this import

const prisma = new PrismaClient();
let wss: WebSocketServer;
const channelClients = new Map<string, Set<WebSocket>>();

function broadcastToChannel(
  channelId: string,
  data: object,
  excludeSocket: WebSocket | null = null
) {
  const clients = channelClients.get(channelId);
  if (clients) {
    clients.forEach((client) => {
      if (excludeSocket !== client && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  }
}

async function main() {
  const server: Server = app.listen(config.port, () => {
    console.log('Server running on port', config.port);
  });

  // new WebSocket server
  wss = new WebSocketServer({ server });

  // client handle connection
  wss.on('connection', (ws) => {
    console.log('New WebSocket connection!');

    let channelId: string | null = null;
    // client received message
    ws.on('message', async (message) => {
      try {
        const parsed = JSON.parse(message.toString());
        if (parsed.type === 'subscribe' && parsed.channelId) {
          channelId = parsed.channelId;

          if (channelId && !channelClients.has(channelId)) {
            channelClients.set(channelId, new Set());
          }
          channelId && channelClients.get(channelId)?.add(ws);

          // Send channel history to the newly connected client
          const channelHistory = await prisma.message.findMany({
            where: { channelId },
            orderBy: { timestamp: 'asc' },
            take: 50, // Limit to recent messages
          });

          ws.send(
            JSON.stringify({
              type: 'history',
              channelId,
              messages: channelHistory,
            })
          );

          ws.send(JSON.stringify({ type: 'subscribed', channelId }));
        } else if (parsed.type === 'message') {
          // Handle new chat message
          const { channelId, content, senderId, messageType = 'text' } = parsed;

          // Create a new message object with MongoDB ObjectId
          const newMessage = {
            channelId,
            senderId,
            content,
            timestamp: new Date(),
            type: messageType,
            status: 'sent',
          };

          // Save message to database
          const savedMessage = await prisma.message.create({
            data: newMessage,
          });

          // Broadcast to all clients in the channel
          broadcastToChannel(channelId, {
            type: 'new_message',
            message: savedMessage,
          });

          // Confirm message receipt to sender
          ws.send(
            JSON.stringify({
              type: 'message_sent',
              messageId: savedMessage.id,
              timestamp: savedMessage.timestamp,
            })
          );
        } else if (parsed.type === 'typing') {
          // Handle typing indicators
          const { channelId, senderId, isTyping } = parsed;
          broadcastToChannel(
            channelId,
            {
              type: 'user_typing',
              senderId,
              isTyping,
            },
            ws
          ); // Exclude the sender
        } else if (parsed.type === 'read_receipt') {
          // Handle read receipts
          const { channelId, messageId, senderId } = parsed;

          // Update message status in database
          await prisma.message.update({
            where: { id: messageId },
            data: { status: 'read' },
          });

          broadcastToChannel(channelId, {
            type: 'message_read',
            messageId,
            senderId,
          });
        }
      } catch (err: any) {
        console.error('error:', err.message);
      }
    });

    ws.on('close', () => {
      if (channelId) {
        channelClients.get(channelId)?.delete(ws);
        if (channelClients.get(channelId)?.size === 0) {
          channelClients.delete(channelId);
        }
      }
      console.log('Client disconnected!');
    });
  });
}

main();
