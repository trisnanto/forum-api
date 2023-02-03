/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */
class CommentUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async addComment(useCasePayload, threadId, credentialId) {
    this._verifyPayload(useCasePayload);
    return this._threadRepository.addComment(useCasePayload, threadId, credentialId);
  }

  async getCommentById(useCasePayload) {
    return this._threadRepository.getCommentById(useCasePayload);
  }

  _verifyPayload(payload) {
    const { content } = (payload) || { content: null };

    if (!content) {
      throw new Error('COMMENT_USE_CASE.NOT_CONTAIN_CONTENT');
    }

    if (typeof content !== 'string') {
      throw new Error('COMMENT_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }

  async deleteCommentById(useCasePayload, credentialId) {
    return this._threadRepository.deleteCommentById(useCasePayload, credentialId);
  }
}

module.exports = CommentUseCase;
