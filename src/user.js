import DB from './database.js';

export const USERS_TABLE_NAME = 'users';

class User {
  static async createUsersTable() {
    const usersQuery = `
      CREATE TABLE IF NOT EXISTS ${USERS_TABLE_NAME} (
        id SERIAL PRIMARY KEY,   
        user_id VARCHAR(50) UNIQUE NOT NULL,
        user_name VARCHAR(150) NOT NULL,
        phone_number VARCHAR(20) UNIQUE NOT NULL,
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
      INSERT INTO ${USERS_TABLE_NAME} (user_id, user_name, phone_number, avatar, online)
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
