/* eslint-disable max-len */
/* eslint-disable no-underscore-dangle */
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const CommentRepository = require('../../Domains/comments/CommentRepository');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(commentPayload, threadId, credentialId) {
    const { content } = commentPayload;
    const id = `comment-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5) RETURNING id, content, owner',
      values: [id, threadId, content, credentialId, date],
    };

    const { rows } = await this._pool.query(query);

    return rows[0];
  }

  async deleteCommentById(commentId) {
    const query = {
      text: 'UPDATE comments SET is_delete = true WHERE id = $1 RETURNING id',
      values: [commentId],
    };
    const result = await this._pool.query(query);

    return result.rows[0].id;
  }

  async getCommentById(commentId) {
    const query = {
      text: 'SELECT comments.id, users.username, date, content, is_delete FROM comments LEFT JOIN users ON comments.owner = users.id WHERE comments.id = $1 ORDER BY date ASC',
      values: [commentId],
    };
    const result = await this._pool.query(query);

    return result.rows[0];
  }

  async getCommentsByThreadId(threadId) {
    const query1 = {
      text: 'SELECT comments.id, users.username, date, content, is_delete FROM comments LEFT JOIN users ON comments.owner = users.id WHERE comments.thread_id = $1 ORDER BY date ASC',
      values: [threadId],
    };
    const result1 = await this._pool.query(query1);

    if (!result1.rowCount) {
      return [];
    }
    return result1.rows;
  }

  async verifyCommentId(commentId) {
    const query = {
      text: 'SELECT id FROM comments WHERE id = $1',
      values: [commentId],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Komentar tidak ditemukan');
    }

    return result.rows[0].id;
  }

  async verifyCommentOwnership(commentId, credentialId) {
    const query = {
      text: 'SELECT owner FROM comments WHERE id = $1',
      values: [commentId],
    };
    const result = await this._pool.query(query);

    if (result.rows[0].owner !== credentialId) {
      throw new AuthorizationError('Komentar hanya dapat dihapus oleh pemiliknya');
    }

    return result.rows[0].owner;
  }
}

module.exports = CommentRepositoryPostgres;
