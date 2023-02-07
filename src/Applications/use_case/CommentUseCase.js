/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */
class CommentUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async addComment(useCasePayload, threadId, credentialId) {
    this._verifyPayload(useCasePayload);
    await this._threadRepository.verifyThreadId(threadId);
    return this._commentRepository.addComment(useCasePayload, threadId, credentialId);
  }

  async getCommentById(useCasePayload) {
    await this._commentRepository.verifyCommentId(useCasePayload);
    return this._commentRepository.getCommentById(useCasePayload);
  }

  async deleteCommentById(useCasePayload, threadId, credentialId) {
    await this._threadRepository.verifyThreadId(threadId);
    await this._commentRepository.verifyCommentId(useCasePayload);
    await this._commentRepository.verifyCommentOwnership(useCasePayload, credentialId);
    return this._commentRepository.deleteCommentById(useCasePayload);
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
}

module.exports = CommentUseCase;
