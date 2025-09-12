import Fastify from 'fastify';
import fastifyIO from 'fastify-socket.io';
import cors from '@fastify/cors';
import User from './user.js';
import ChatRoom from './chatRoom.js';
import RoomMessages from './roomMessages.js';

const PORT = 3030;

// let users = [
//   {
//     userId: 'admin',
//     userName: 'Константинопольский КОнстнатин Констнатинович',
//     phoneNumber: '899912345678',
//     avatar: '',
//     online: false,
//     chatRooms: ['chatroom-1', 'chatroom-2'],
//   },
//   {
//     userId: 'guest',
//     userName: 'Леопольдов Леопольд Леопольдович',
//     phoneNumber: '888812345678',
//     avatar: '',
//     online: true,
//     chatRooms: ['chatroom-1'],
//   },
// ];

await User.createUsersTable();
await ChatRoom.createChatRoomsTable();

const fastifyServer = Fastify({
  logger: true,
});

fastifyServer.register(cors, {
  origin: ['http://localhost:3001', 'http://localhost:3000'],
  methods: ['GET', 'POST'],
  credentials: true,
});

fastifyServer.register(fastifyIO, {
  cors: {
    origin: ['http://localhost:3001', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// fastifyServer.get('/', function (request, reply) {
//   fastifyServer.io.emit('hello', { message: 'Hello!' });
// });

// await User.createUser({
//   userId: 'admin',
//   userName: 'Константинопольский КОнстнатин Констнатинович',
//   phoneNumber: '899912345678',
//   avatar: '',
//   online: false,
// });

fastifyServer.get('/create-user', async (request, reply) => {
  const user = await User.createUser(req.body);
});

fastifyServer.get('/get-messages-by-room-id/:roomId', async (request, reply) => {
  const { roomId } = request.params;

  const currentRoomMessages = await RoomMessages.getRoomMessages(roomId, 100);

  reply.send(currentRoomMessages);
});

fastifyServer.get('/get-user-rooms', async (_, reply) => {
  const chatRooms = await ChatRoom.getAllRooms();

  reply.send(chatRooms);
});

fastifyServer.ready().then(() => {
  fastifyServer.io.on('connection', (socket) => {
    socket.on('join_room', (roomId) => {
      socket.join(roomId);
    });

    socket.on('client_message', async (data) => {
      console.log('Сообщение от клиента:', data);

      try {
        const { roomId, userId, text } = data;

        const newMessage = await RoomMessages.createMessage(roomId, userId, text);

        socket.emit('server_response', { message: 'Сообщение получено!' });
        fastifyServer.io.to(roomId).emit('new_message', newMessage);

        socket.on('disconnect', () => {
          console.log('Клиент отключился:', socket.id);
        });
      } catch (error) {
        console.error(error);
        socket.emit('server_response', {
          status: 'error',
          message: 'Ошибка отправки сообщения',
        });
      }
    });
  });
});

try {
  await fastifyServer.listen({ port: PORT });

  console.log(`RUNNING ON PORT ${PORT}`);
} catch (err) {
  fastifyServer.log.error(err);
  process.exit(1);
}
