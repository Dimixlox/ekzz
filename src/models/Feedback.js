const db = require("../db");

class Feedback {
  static async create({ applicationId, rating, comment }) {
    const { rows } = await db.query(
      `INSERT INTO feedback (application_id, rating, comment)
       VALUES ($1,$2,$3)
       RETURNING *`,
      [applicationId, rating, comment]
    );
    return rows[0];
  }

  static async existsForApplication(applicationId) {
    const { rows } = await db.query(
      "SELECT id FROM feedback WHERE application_id=$1",
      [applicationId]
    );
    return !!rows[0];
  }
}

module.exports = Feedback;
