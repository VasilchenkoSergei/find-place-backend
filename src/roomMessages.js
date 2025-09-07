import DB from './database.js';

const MESSAGES_TABLE_NAME = 'room_messages';

class RoomMessages {
  static async createRoomMessagesTable(tableRef) {
    const messagesQuery = `
      CREATE TABLE IF NOT EXISTS ${MESSAGES_TABLE_NAME} (
        id SERIAL PRIMARY KEY,
        room_id VARCHAR(150) REFERENCES ${tableRef}(room_id) ON DELETE CASCADE,
        sent_by_user_id VARCHAR(150) NOT NULL,
        text TEXT NOT NULL,
        sent_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    try {
      await DB.query(messagesQuery);
    } catch (error) {
      console.log('createChatRoomsTable error:', error);
    }
  }

  static async getRoomMessages(roomId, limit) {
    const query = `
      SELECT * FROM ${MESSAGES_TABLE_NAME} 
      WHERE room_id = $1 
      ORDER BY sent_date ASC 
      LIMIT $2
    `;
    const values = [roomId, limit];

    try {
      const result = await DB.query(query, values);
      return result.rows;
    } catch (error) {
      console.error('Ошибка при получении сообщений:', error);
      throw error;
    }
  }

  static async createMessage(roomId, sentByUserId, text) {
    const query = `
      INSERT INTO ${MESSAGES_TABLE_NAME} (room_id, sent_by_user_id, text)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const values = [roomId, sentByUserId, text];

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
      WHERE id = $1 AND sent_by_user_id = $2
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
