import ChatRoom, { CHAT_ROOMS_TABLE_NAME } from './chatRoom.js';
import RoomMessages from './roomMessages.js';
import User from './user.js';

class DatabaseInitialize {
  static async initialize() {
    try {
      await User.createUsersTable();
      await ChatRoom.createChatRoomsTable();
      await RoomMessages.createRoomMessagesTable(CHAT_ROOMS_TABLE_NAME);
    } catch (error) {
      console.error('Ошибка инициализации Базы данных - ', error);
    }
  }
}

export default DatabaseInitialize;
