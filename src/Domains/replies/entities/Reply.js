/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */
/* eslint-disable camelcase */
class Reply {
  constructor({
    id, username, date, content, is_delete,
  }) {
    this._verifyPayload(content);
    this.id = id;
    this.username = username;
    this.date = date;
    this.content = is_delete ? '**balasan telah dihapus**' : content;
  }

  _verifyPayload(content) {
    if (!content) {
      throw new Error('REPLY.NOT_CONTAIN_CONTENT');
    }
    if (typeof content !== 'string') {
      throw new Error('REPLY.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = Reply;
