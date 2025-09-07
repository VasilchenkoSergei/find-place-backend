import DB from './database.js';

const TABLE_NAME = 'users';

class User {
  static async createUserTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
        user_id VARCHAR(50) PRIMARY KEY,
        user_name VARCHAR(150) NOT NULL,
        phone_number VARCHAR(20) NOT NULL UNIQUE,
        avatar TEXT DEFAULT '',
        online BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await DB.query(query);
  }

  static async createUser(userData) {
    const query = `
      INSERT INTO ${TABLE_NAME} (user_id, user_name, phone_number, avatar, online)
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
      console.log('Пользователь создан:', result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.error('Ошибка при создании пользователя:', error);
      throw error;
    }
  }

  static async findAll() {
    const result = await DB.query('SELECT * FROM users ORDER BY id');
    return result.rows;
  }

  static async findById(id) {
    const result = await DB.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
  }
}

export default User;
