import DB from './database.js';

export const CHAT_ROOMS_TABLE_NAME = 'chat_rooms';

class ChatRoom {
  static async createChatRoomsTable() {
    const chatRoomsQuery = `
      CREATE TABLE IF NOT EXISTS ${CHAT_ROOMS_TABLE_NAME} (
          room_id VARCHAR(150) PRIMARY KEY,
          room_name VARCHAR(150) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    try {
      await DB.query(chatRoomsQuery);
    } catch (error) {
      console.log('Ошибка создания таблицы комнат', error);
    }
  }

  static async createRoom(roomId, roomName) {
    const query = `
      INSERT INTO ${CHAT_ROOMS_TABLE_NAME} (room_id, room_name)
      VALUES ($1, $2)
      RETURNING *
    `;
    const values = [roomId, roomName];

    try {
      const result = await DB.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Ошибка при создании комнаты:', error);
      throw error;
    }
  }

  static async getAllRooms() {
    const query = `
      SELECT room_id as "roomId", room_name as "roomName"
      FROM ${CHAT_ROOMS_TABLE_NAME} 
      ORDER BY created_at DESC
    `;
    try {
      const result = await DB.query(query);
      return result.rows;
    } catch (error) {
      console.error('Ошибка при получении сообщений:', error);
      throw error;
    }
  }
}

export default ChatRoom;
