import DB from './database.js';

export const CHAT_ROOMS_TABLE_NAME = 'chat_rooms';

class ChatRoom {
  static async createChatRoomsTable() {
    const chatRoomsQuery = `
      CREATE TABLE IF NOT EXISTS ${CHAT_ROOMS_TABLE_NAME} (
          id SERIAL PRIMARY KEY NOT NULL,
          place_id VARCHAR(150) NOT NULL UNIQUE,
          place_name VARCHAR(150) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    try {
      const result = await DB.query(chatRoomsQuery);
      return result.rows[0];
    } catch (error) {
      console.log('Ошибка создания таблицы комнат', error);
    }
  }

  static async createRoom(placeId, placeName) {
    const query = `
      INSERT INTO ${CHAT_ROOMS_TABLE_NAME} (place_id, place_name)
      VALUES ($1, $2)
      RETURNING *
    `;
    const values = [placeId, placeName];

    try {
      const result = await DB.query(query, values);
      return result.rows[0];
    } catch (error) {
      // Проверка дубликата
      if (error.code === '23505') {
        return {
          success: false,
          error: 'Комната для этого места уже существует',
          code: 'ROOM_ALREADY_EXISTS',
        };
      }

      console.error('Ошибка при создании комнаты:', error);
      throw error;
    }
  }

  static async getAllRooms() {
    const query = `
      SELECT id, place_id as "placeId", place_name as "placeName"
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
