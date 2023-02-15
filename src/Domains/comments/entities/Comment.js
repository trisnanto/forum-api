/* eslint-disable camelcase */
class Comment {
  constructor({
    id, username, date, content, is_delete, like_count,
  }, replies) {
    this.id = id;
    this.username = username;
    this.date = date;
    this.replies = replies;
    this.content = is_delete ? '**komentar telah dihapus**' : content;
    this.likeCount = parseInt(like_count, 10);
  }
}

module.exports = Comment;
