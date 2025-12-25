const db = require("../db");

class User {
  static async findByLogin(login) {
    const { rows } = await db.query("SELECT * FROM users WHERE login=$1", [login]);
    return rows[0] || null;
  }

  static async findById(id) {
    const { rows } = await db.query("SELECT * FROM users WHERE id=$1", [id]);
    return rows[0] || null;
  }

  static async create({ login, passwordHash, fullName, phone, email }) {
    const { rows } = await db.query(
      `INSERT INTO users (login, password_hash, full_name, phone, email)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING *`,
      [login, passwordHash, fullName, phone, email]
    );
    return rows[0];
  }
}

module.exports = User;
