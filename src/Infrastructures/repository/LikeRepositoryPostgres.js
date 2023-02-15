/* eslint-disable max-len */
/* eslint-disable no-underscore-dangle */
const LikeRepository = require('../../Domains/likes/LikeRepository');

class LikeRepositoryPostgres extends LikeRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addLike(commentId, credentialId) {
    const id = `like-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: 'INSERT INTO likes VALUES($1, $2, $3, $4) RETURNING id',
      values: [id, commentId, credentialId, date],
    };

    const { rows } = await this._pool.query(query);

    return rows[0].id;
  }

  async deleteLikeById(likeId) {
    const query = {
      text: 'DELETE FROM likes WHERE id = $1',
      values: [likeId],
    };

    await this._pool.query(query);
  }

  async isAlreadyLiked(commentId, credentialId) {
    const query = {
      text: 'SELECT id FROM likes WHERE comment_id = $1 AND owner = $2',
      values: [commentId, credentialId],
    };
    const result = await this._pool.query(query);

    return (result.rowCount) ? result.rows[0].id : false;
  }
}

module.exports = LikeRepositoryPostgres;
