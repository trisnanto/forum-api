/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */
class ReplyUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async addReply(useCasePayload, threadId, commentId, credentialId) {
    this._verifyPayload(useCasePayload);
    return this._threadRepository.addReply(useCasePayload, threadId, commentId, credentialId);
  }

  _verifyPayload(payload) {
    const { content } = (payload) || { content: null };

    if (!content) {
      throw new Error('REPLY_USE_CASE.NOT_CONTAIN_CONTENT');
    }

    if (typeof content !== 'string') {
      throw new Error('REPLY_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }

  async deleteReplyById(useCasePayload, credentialId) {
    return this._threadRepository.deleteReplyById(useCasePayload, credentialId);
  }
}

module.exports = ReplyUseCase;
