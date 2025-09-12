import { CHAT_ROOMS_TABLE_NAME } from './chatRoom.js';
import DB from './database.js';

const ROOM_PARTICIPANTS_TABLE_NAME = 'room_participants';

class RoomParticipants {
  static async createRoomParticipantsTable() {
    const participantsQuery = `
      CREATE TABLE IF NOT EXISTS ${ROOM_PARTICIPANTS_TABLE_NAME} (
        id SERIAL PRIMARY KEY,
        room_id VARCHAR(150) REFERENCES ${CHAT_ROOMS_TABLE_NAME}(room_id) ON DELETE CASCADE,
        user_id VARCHAR(150) NOT NULL,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(room_id, user_id)
      )
    `;

    await DB.query(participantsQuery);
  }

  static async createParticipant(roomId, userId) {
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

export default RoomParticipants;
