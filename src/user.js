import DB from './database.js';

const ROOM_USERS_TABLE_NAME = 'room_users';

class User {
  static async createUsersTable() {
    const usersQuery = `
      CREATE TABLE IF NOT EXISTS ${ROOM_USERS_TABLE_NAME} (
        user_id VARCHAR(50) PRIMARY KEY,
        user_name VARCHAR(150) NOT NULL,
        phone_number VARCHAR(20) NOT NULL UNIQUE,
        avatar TEXT DEFAULT '',
        online BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await DB.query(usersQuery);
  }

  static async createUser(userData) {
    const query = `
      INSERT INTO ${ROOM_USERS_TABLE_NAME} (user_id, user_name, phone_number, avatar, online)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [
      userData.userId,
      userData.userName,
      userData.phoneNumber,
      userData.avatar || '',
      userData.online || false,
    ];

    try {
      const result = await DB.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Ошибка при создании пользователя:', error);
      throw error;
    }
  }
}

export default User;
