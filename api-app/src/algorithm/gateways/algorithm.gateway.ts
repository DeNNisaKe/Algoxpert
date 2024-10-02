import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: { origin: 'http://localhost:3000', credentials: true },
})
export class AlgorithmGateway {
  @WebSocketServer()
  server: Server;

  sendProgress(data: any) {
    this.server.emit('progress', data);
  }
}
