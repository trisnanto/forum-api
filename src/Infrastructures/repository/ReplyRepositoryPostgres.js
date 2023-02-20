/* eslint-disable max-len */
/* eslint-disable no-underscore-dangle */
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const ReplyRepository = require('../../Domains/replies/ReplyRepository');

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply(replyPayload, commentId, credentialId) {
    const { content } = replyPayload;
    const id = `reply-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: 'INSERT INTO replies VALUES($1, $2, $3, $4, $5) RETURNING id, content, owner',
      values: [id, commentId, content, credentialId, date],
    };

    const { rows } = await this._pool.query(query);

    return rows[0];
  }

  async deleteReplyById(replyId) {
    const query = {
      text: 'UPDATE replies SET is_delete = true WHERE id = $1 RETURNING id',
      values: [replyId],
    };
    const result = await this._pool.query(query);

    return result.rows[0].id;
  }

  async getRepliesByThreadId(threadId) {
    const query = {
      text: 'SELECT replies.id, comment_id, replies.content, replies.date, users.username, replies.is_delete FROM replies LEFT JOIN comments ON replies.comment_id = comments.id LEFT JOIN users ON replies.owner = users.id WHERE comments.thread_id = $1 ORDER BY date ASC',
      values: [threadId],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      return [];
    }
    return result.rows;
  }

  async verifyReplyId(replyId) {
    const query = {
      text: 'SELECT id FROM replies WHERE id = $1',
      values: [replyId],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Balasan tidak ditemukan');
    }

    return result.rows[0].id;
  }

  async verifyReplyOwnership(replyId, credentialId) {
    const query = {
      text: 'SELECT owner FROM replies WHERE id = $1',
      values: [replyId],
    };
    const result = await this._pool.query(query);

    if (result.rows[0].owner !== credentialId) {
      throw new AuthorizationError('Balasan hanya dapat dihapus oleh pemiliknya');
    }

    return result.rows[0].owner;
  }
}

module.exports = ReplyRepositoryPostgres;
