import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:5173', 'https://meetup-planner-ruddy.vercel.app'],
    credentials: true,
  },
})
export class RealtimeGateway {
  @WebSocketServer() server: Server;

  emitLocationUpdate(payload: any) {
    this.server.emit('locationUpdate', payload);
  }
}