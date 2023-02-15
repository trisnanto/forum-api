/* eslint-disable no-unused-vars */
/* eslint-disable class-methods-use-this */
class LikeRepository {
  async addLike(commentId, credentialId) {
    throw new Error('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async deleteLikeById(likeId) {
    throw new Error('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async isAlreadyLiked(commentId, credentialId) {
    throw new Error('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }
}

module.exports = LikeRepository;
