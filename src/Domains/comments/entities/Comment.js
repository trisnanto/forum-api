/* eslint-disable camelcase */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */
class Comment {
  constructor({
    id, username, date, content, is_delete, like_count,
  }, replies) {
    this._verifyPayload(content);
    this.id = id;
    this.username = username;
    this.date = date;
    this.replies = replies;
    this.content = is_delete ? '**komentar telah dihapus**' : content;
    this.likeCount = parseInt(like_count, 10);
  }

  _verifyPayload(content) {
    if (!content) {
      throw new Error('COMMENT.NOT_CONTAIN_CONTENT');
    }
    if (typeof content !== 'string') {
      throw new Error('COMMENT.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = Comment;
