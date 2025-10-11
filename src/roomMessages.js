import DB from './database.js';
import { CHAT_ROOMS_TABLE_NAME } from './chatRoom.js';
import { USERS_TABLE_NAME } from './user.js';

const MESSAGES_TABLE_NAME = 'room_messages';

class RoomMessages {
  static async createRoomMessagesTable() {
    const messagesQuery = `
      CREATE TABLE IF NOT EXISTS ${MESSAGES_TABLE_NAME} (
        id SERIAL PRIMARY KEY,
        place_id VARCHAR(150) REFERENCES ${CHAT_ROOMS_TABLE_NAME}(place_id) ON DELETE CASCADE,
        user_id UUID REFERENCES ${USERS_TABLE_NAME}(user_id) ON DELETE CASCADE,
        text TEXT NOT NULL,
        created_at BIGINT DEFAULT (EXTRACT(EPOCH FROM CURRENT_TIMESTAMP) * 1000)::BIGINT,
        updated_at BIGINT DEFAULT (EXTRACT(EPOCH FROM CURRENT_TIMESTAMP) * 1000)::BIGINT
      )
    `;

    try {
      await DB.query(messagesQuery);
    } catch (error) {
      console.log('Ошибка создания таблицы сообщений', error);
    }
  }

  static async getRoomMessages(placeId, limit) {
    const query = `
      SELECT 
        messages.id, 
        messages.text, 
        messages.created_at as "createdAt", 
        json_build_object(
          'userId', users.user_id,
          'name', users.name
        ) as "user"
      FROM ${MESSAGES_TABLE_NAME} messages
      LEFT JOIN ${USERS_TABLE_NAME} users ON messages.user_id = users.user_id
      WHERE messages.place_id = $1 
      ORDER BY messages.created_at ASC 
      LIMIT $2
    `;
    const values = [placeId, limit];

    try {
      const result = await DB.query(query, values);
      return result.rows.map((row) => ({
        ...row,
        createdAt: Number(row.createdAt),
      }));
    } catch (error) {
      console.error('Ошибка при получении сообщений:', error);
      throw error;
    }
  }

  static async createMessage(placeId, userId, text) {
    const query = `
      INSERT INTO ${MESSAGES_TABLE_NAME} (place_id, user_id, text)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const values = [placeId, userId, text];

    try {
      const result = await DB.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Ошибка при добавлении сообщения:', error);
      throw error;
    }
  }

  static async deleteMessage(messageId, userId) {
    const query = `
      DELETE FROM ${MESSAGES_TABLE_NAME} 
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `;
    const values = [messageId, userId];

    try {
      const result = await DB.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Ошибка при удалении сообщения:', error);
      throw error;
    }
  }
}

export default RoomMessages;
