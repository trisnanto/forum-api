/* eslint-disable max-len */
/* eslint-disable no-underscore-dangle */
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const ForumThread = require('../../Domains/threads/entities/ForumThread');
const ThreadRepository = require('../../Domains/threads/ThreadRepository');

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addThread(newThread, credentialId) {
    const { title, body } = newThread;
    const id = `thread-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: 'INSERT INTO threads VALUES($1, $2, $3, $4, $5) RETURNING id, title, owner',
      values: [id, title, body, credentialId, date],
    };

    const result = await this._pool.query(query);

    return new ForumThread({ ...result.rows[0] });
  }

  async getThreadById(threadId) {
    const query1 = {
      text: 'SELECT threads.id, title, body, date, users.username FROM threads LEFT JOIN users ON threads.owner = users.id WHERE threads.id = $1',
      values: [threadId],
    };

    const result1 = await this._pool.query(query1);

    if (!result1.rowCount) {
      throw new NotFoundError('Thread tidak ditemukan');
    }
    const thread = result1.rows[0];

    const query2 = {
      text: 'SELECT comments.id comment_id, a.username comment_username, comments.date comment_date, comments.content comment_content, comments.is_delete comment_is_delete, replies.id replies_id, replies.comment_id replies_comment_id, replies.content replies_content, replies.date replies_date, b.username replies_username, replies.is_delete replies_is_delete FROM comments FULL JOIN replies ON replies.comment_id = comments.id LEFT JOIN users a ON a.id = comments.owner LEFT JOIN users b ON b.id = replies.owner WHERE comments.thread_id = $1 ORDER BY comments.date, replies.date ASC',
      values: [threadId],
    };

    const { rows, rowCount } = await this._pool.query(query2);

    if (rowCount > 0) {
      thread.comments = [];
      let threadCommentIndex = -1;
      rows.forEach((row) => {
        const indexComment = thread.comments.findIndex((comment) => comment.id === row.comment_id);
        if (indexComment === -1) {
          const dataComment = {
            id: row.comment_id,
            username: row.comment_username,
            date: row.comment_date,
            replies: [],
            content: (row.comment_is_delete) ? '**komentar telah dihapus**' : row.comment_content,
          };
          thread.comments.push(dataComment);
          threadCommentIndex += 1;
          if (row.replies_id) {
            const dataReply = {
              id: row.replies_id,
              content: (row.replies_is_delete) ? '**balasan telah dihapus**' : row.replies_content,
              username: row.replies_username,
              date: row.replies_date,
            };
            thread.comments[threadCommentIndex].replies.push(dataReply);
          }
        } else {
          const dataReply = {
            id: row.replies_id,
            content: (row.replies_is_delete) ? '**balasan telah dihapus**' : row.replies_content,
            username: row.replies_username,
            date: row.replies_date,
          };
          thread.comments[indexComment].replies.push(dataReply);
        }
      });
    }

    return thread;
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

  async deleteCommentById(commentId, credentialId) {
    const query1 = {
      text: 'SELECT owner FROM comments WHERE id = $1',
      values: [commentId],
    };
    const result1 = await this._pool.query(query1);

    if (!result1.rowCount) {
      throw new NotFoundError('Komentar tidak ditemukan');
    }

    if (result1.rows[0].owner !== credentialId) {
      throw new AuthorizationError('Komentar hanya dapat dihapus oleh pemiliknya');
    }

    const query2 = {
      text: 'UPDATE comments SET is_delete = true WHERE id = $1 RETURNING id',
      values: [commentId],
    };
    const result2 = await this._pool.query(query2);

    return result2.rows[0].id;
  }

  async getCommentById(commentId) {
    const query1 = {
      text: 'SELECT comments.id, users.username, date, content, is_delete FROM comments LEFT JOIN users ON comments.owner = users.id WHERE comments.id = $1 ORDER BY date ASC',
      values: [commentId],
    };
    const result1 = await this._pool.query(query1);

    if (!result1.rowCount) {
      throw new NotFoundError('Komentar tidak ditemukan');
    }
    return result1.rows;
  }

  async addReply(replyPayload, threadId, commentId, credentialId) {
    const { content } = replyPayload;
    const id = `reply-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: 'INSERT INTO replies VALUES($1, $2, $3, $4, $5, $6) RETURNING id, content, owner',
      values: [id, threadId, commentId, content, credentialId, date],
    };

    const { rows } = await this._pool.query(query);

    return rows[0];
  }

  async deleteReplyById(replyId, credentialId) {
    const query1 = {
      text: 'SELECT owner FROM replies WHERE id = $1',
      values: [replyId],
    };
    const result1 = await this._pool.query(query1);

    if (!result1.rowCount) {
      throw new NotFoundError('Balasan tidak ditemukan');
    }

    if (result1.rows[0].owner !== credentialId) {
      throw new AuthorizationError('Balasan hanya dapat dihapus oleh pemiliknya');
    }

    const query2 = {
      text: 'UPDATE replies SET is_delete = true WHERE id = $1 RETURNING id',
      values: [replyId],
    };
    const result2 = await this._pool.query(query2);

    return result2.rows[0].id;
  }
}

module.exports = ThreadRepositoryPostgres;
