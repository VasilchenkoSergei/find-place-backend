import DB from './database.js';

const CHAT_ROOMS_TABLE_NAME = 'chat_rooms';
const ROOM_PARTICIPIANTS_TABLE_NAME = 'room_participiants';
const MESSAGES_TABLE_NAME = 'room_messages';

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

    const participantsQuery = `
      CREATE TABLE IF NOT EXISTS ${ROOM_PARTICIPIANTS_TABLE_NAME} (
        id SERIAL PRIMARY KEY,
        room_id VARCHAR(150) REFERENCES ${CHAT_ROOMS_TABLE_NAME}(room_id) ON DELETE CASCADE,
        user_id VARCHAR(150) NOT NULL,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(room_id, user_id)
      )
    `;

    const messagesQuery = `
      CREATE TABLE IF NOT EXISTS ${MESSAGES_TABLE_NAME} (
        id SERIAL PRIMARY KEY,
        room_id VARCHAR(150) REFERENCES ${CHAT_ROOMS_TABLE_NAME}(room_id) ON DELETE CASCADE,
        sent_by_user_id VARCHAR(150) NOT NULL,
        text TEXT NOT NULL,
        sent_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    try {
      await DB.query(chatRoomsQuery);
      await DB.query(participantsQuery);
      await DB.query(messagesQuery);
    } catch (error) {
      console.log('createChatRoomsTable error:', error);
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

  static async addParticipant(roomId, userId) {
    const query = `
      INSERT INTO ${ROOM_PARTICIPANTS_TABLE_NAME} (room_id, user_id)
      VALUES ($1, $2)
      ON CONFLICT (room_id, user_id) DO NOTHING
      RETURNING *
    `;
    const values = [roomId, userId];

    try {
      const result = await DB.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Ошибка при добавлении участника:', error);
      throw error;
    }
  }
}

export default ChatRoom;
