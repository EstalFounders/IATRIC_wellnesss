import { Server } from 'socket.io-client';

export default function handler(req, res) {
  if (!res.socket.server.io) {
    const httpServer = res.socket.server;
    const io = new Server(httpServer, {
      // options
    });
    httpServer.io = io;

    io.on('connection', socket => {
      console.log('A user connected');
      socket.on('disconnect', () => {
        console.log('User disconnected');
      });

      socket.on('signal', data => {
        io.emit('signal', data);
      });
    });
  }
  res.end();
}
