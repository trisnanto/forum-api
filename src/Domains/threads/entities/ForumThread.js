/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */
class ForumThread {
  constructor(payload) {
    this._verifyPayload(payload);

    this.id = payload.id;
    this.title = payload.title;
    this.owner = payload.owner;
  }

  _verifyPayload(payload) {
    const { id, title, owner } = payload;

    if (!id || !title || !owner) {
      throw new Error('FORUM_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof id !== 'string' || typeof title !== 'string' || typeof owner !== 'string') {
      throw new Error('FORUM_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = ForumThread;
