/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */
class LikeUseCase {
  constructor({ threadRepository, commentRepository, likeRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._likeRepository = likeRepository;
  }

  async updateLike(threadId, commentId, credentialId) {
    await this._threadRepository.verifyThreadId(threadId);
    await this._commentRepository.verifyCommentId(commentId);
    const likeId = await this._likeRepository.isAlreadyLiked(commentId, credentialId);
    return await (likeId) ? this._likeRepository.deleteLikeById(likeId)
      : this._likeRepository.addLike(commentId, credentialId);
  }
}

module.exports = LikeUseCase;
