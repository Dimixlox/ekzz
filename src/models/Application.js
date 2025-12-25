const db = require("../db");

class Application {
  static async create({ userId, courseName, desiredStartDateISO, paymentMethod }) {
    const { rows } = await db.query(
      `INSERT INTO applications (user_id, course_name, desired_start_date, payment_method, status)
       VALUES ($1,$2,$3,$4,'Новая')
       RETURNING *`,
      [userId, courseName, desiredStartDateISO, paymentMethod]
    );
    return rows[0];
  }

  static async listForUser(userId) {
    const { rows } = await db.query(
      `SELECT a.*, f.rating, f.comment AS feedback_comment, f.created_at AS feedback_created_at
       FROM applications a
       LEFT JOIN feedback f ON f.application_id = a.id
       WHERE a.user_id = $1
       ORDER BY a.created_at DESC`,
      [userId]
    );
    return rows;
  }

  static async findByIdForUser(appId, userId) {
    const { rows } = await db.query(
      "SELECT * FROM applications WHERE id=$1 AND user_id=$2",
      [appId, userId]
    );
    return rows[0] || null;
  }

  static async adminList({ status, course, q, limit, offset }) {
    const where = [];
    const params = [];
    let i = 1;

    if (status) { where.push(`a.status = $${i++}`); params.push(status); }
    if (course) { where.push(`a.course_name = $${i++}`); params.push(course); }
    if (q) {
      where.push(`(u.login ILIKE $${i} OR u.full_name ILIKE $${i})`);
      params.push(`%${q}%`);
      i++;
    }

    const whereSql = where.length ? "WHERE " + where.join(" AND ") : "";

    const countRes = await db.query(
      `SELECT COUNT(*)::int AS total
       FROM applications a
       JOIN users u ON u.id = a.user_id
       ${whereSql}`,
      params
    );
    const total = countRes.rows[0].total;

    params.push(limit, offset);
    const { rows } = await db.query(
      `SELECT a.*, u.login, u.full_name, u.phone
       FROM applications a
       JOIN users u ON u.id = a.user_id
       ${whereSql}
       ORDER BY a.created_at DESC
       LIMIT $${i++} OFFSET $${i++}`,
      params
    );

    return { total, items: rows };
  }

  static async updateStatus(appId, status) {
    const { rows } = await db.query(
      `UPDATE applications SET status=$1 WHERE id=$2 RETURNING *`,
      [status, appId]
    );
    return rows[0] || null;
  }
}

module.exports = Application;
