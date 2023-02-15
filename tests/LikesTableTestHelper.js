/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const LikesTableTestHelper = {
  async addLike({
    id = 'like-123', commentId = 'comment-123', owner = 'user-123',
  }) {
    const date = new Date().toISOString();
    const query = {
      text: 'INSERT INTO likes VALUES($1, $2, $3, $4) RETURNING id',
      values: [id, commentId, owner, date],
    };

    const { rows } = await pool.query(query);
    return rows[0].id;
  },

  async deleteLikeById(id) {
    const query = {
      text: 'DELETE FROM likes WHERE id = $1',
      values: [id],
    };

    await pool.query(query);
  },

  async findLikeById(id) {
    const query = {
      text: 'SELECT * FROM likes WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows[0];
  },

  async countLikes(commentId) {
    const query = {
      text: 'SELECT COUNT(id) AS like_count FROM likes WHERE comment_id = $1',
      values: [commentId],
    };

    const result = await pool.query(query);
    return parseInt(result.rows[0].like_count, 10);
  },

  async isAlreadyLiked(commentId, credentialId) {
    const query = {
      text: 'SELECT id FROM replies WHERE comment_id = $1 AND owner = $2',
      values: [commentId, credentialId],
    };
    const result = await pool.query(query);

    return (result.rowCount) ? result.rows[0].id : false;
  },

  async cleanTable() {
    await pool.query('DELETE FROM likes WHERE 1=1');
  },
};

module.exports = LikesTableTestHelper;
