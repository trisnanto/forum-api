/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */
class ReplyUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async addReply(useCasePayload, threadId, commentId, credentialId) {
    this._verifyPayload(useCasePayload);
    await this._threadRepository.verifyThreadId(threadId);
    await this._commentRepository.verifyCommentId(commentId);
    return this._replyRepository.addReply(useCasePayload, commentId, credentialId);
  }

  async deleteReplyById(useCasePayload, threadId, commentId, credentialId) {
    await this._threadRepository.verifyThreadId(threadId);
    await this._commentRepository.verifyCommentId(commentId);
    await this._replyRepository.verifyReplyId(useCasePayload);
    await this._replyRepository.verifyReplyOwnership(useCasePayload, credentialId);
    return this._replyRepository.deleteReplyById(useCasePayload);
  }

  _verifyPayload(payload) {
    const { content } = payload;
    if (!content) {
      throw new Error('REPLY_USE_CASE.NOT_CONTAIN_CONTENT');
    }
    if (typeof content !== 'string') {
      throw new Error('REPLY_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = ReplyUseCase;
