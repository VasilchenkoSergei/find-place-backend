import DB from './database.js';
import bcrypt from 'bcrypt';

export const USERS_TABLE_NAME = 'users';
const saltRounds = 12;

class User {
  static async createUsersTable() {
    const usersQuery = `
      CREATE TABLE IF NOT EXISTS ${USERS_TABLE_NAME} (
        id SERIAL PRIMARY KEY,   
        user_id UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
        name VARCHAR(150) NOT NULL,
        phone VARCHAR(20) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await DB.query(usersQuery);
  }

  static async createUser(userData) {
    try {
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

      const query = `
        INSERT INTO ${USERS_TABLE_NAME} (name, phone, password_hash)
        VALUES ($1, $2, $3)
        RETURNING *
      `;
      const values = [userData.name, userData.phone, hashedPassword];
      const result = await DB.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Ошибка при создании пользователя:', error);
      throw error;
    }
  }

  static async authUser(userData) {
    try {
      const currentUser = await this.findOneByPhone(userData.phone);

      if (!currentUser) {
        throw new Error('Ошибка авторизации. Пользователь не найден');
      }

      const isPasswordValid = await bcrypt.compare(userData.password, currentUser.password_hash);

      if (!isPasswordValid) {
        throw new Error('Ошибка авторизации. Пароль неверный');
      }

      return {
        userId: currentUser.user_id,
        name: currentUser.name,
        phone: currentUser.phone,
      };
    } catch (error) {
      console.error('Ошибка авторизации:', error);
      throw error;
    }
  }

  static async findOneByPhone(phone) {
    const query = `SELECT * FROM ${USERS_TABLE_NAME} WHERE phone = $1 LIMIT 1`;
    const result = await DB.query(query, [phone]);
    return result.rows[0] || null;
  }
}

export default User;
