import Fastify from 'fastify';
import fastifyIO from 'fastify-socket.io';
import cors from '@fastify/cors';
import User from './user.js';
import ChatRoom from './chatRoom.js';
import RoomMessages from './roomMessages.js';
import DatabaseInitialize from './databaseInitialize.js';
import { PLACES_LIST_MOCK } from './mocks/index.js';

const PORT = 3030;

DatabaseInitialize.initialize();

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

fastifyServer.post('/create-user', async (request, reply) => {
  const user = await User.createUser(request.body);

  reply.send(user);
});

fastifyServer.post('/create-user-room', async (request, reply) => {
  const { placeId, placeName } = request.body;
  const userRoom = await ChatRoom.createRoom(placeId, placeName);

  reply.send(userRoom);
});

fastifyServer.get('/get-messages-by-room-id/:placeId', async (request, reply) => {
  const { placeId } = request.params;

  const currentRoomMessages = await RoomMessages.getRoomMessages(placeId, 100);

  reply.send(currentRoomMessages);
});

fastifyServer.get('/get-user-rooms', async (_, reply) => {
  const chatRooms = await ChatRoom.getAllRooms();

  reply.send(chatRooms);
});

fastifyServer.get('/get-places', async (_, reply) => {
  const allRooms = await ChatRoom.getAllRooms();
  const roomsIds = allRooms?.map(({ placeId }) => placeId);
  const formattedPlaces = PLACES_LIST_MOCK.map((place) => {
    if (roomsIds.includes(place.id)) {
      return {
        ...place,
        hasRoom: true,
      };
    }
    return place;
  });

  reply.send(formattedPlaces);
});

fastifyServer.ready().then(() => {
  fastifyServer.io.on('connection', (socket) => {
    socket.on('join_room', (placeId) => {
      socket.join(placeId);
    });

    socket.on('client_message', async (data) => {
      console.log('Сообщение от клиента:', data);

      try {
        const { placeId, user, text } = data;

        const newMessage = await RoomMessages.createMessage(placeId, user.id, text);

        socket.emit('server_response', { message: 'Сообщение получено!' });
        fastifyServer.io.to(placeId).emit('new_message', newMessage);

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
