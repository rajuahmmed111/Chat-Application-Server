import { Server } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { PrismaClient } from '@prisma/client';
import config from './config';
import app from './app';
// import { privateMessageService } from "./app/modules/privateMessage/privateMessage.service";

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
          ws.send(JSON.stringify({ type: 'subscribed', channelId }));
        } else if (parsed.type === 'message') {
          const channelId = parsed.channelId;
          const privateMessage = parsed.message;
          broadcastToChannel(channelId, privateMessage);
        }
        // else if (
        //   parsed.type === "offer" ||
        //   parsed.type === "answer" ||
        //   parsed.type === "candidate"
        // ) {
        //   broadcastToChannel(parsed.channelName, parsed, ws);
        // }
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
