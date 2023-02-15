/* eslint-disable no-underscore-dangle */
const LikeUseCase = require('../../../../Applications/use_case/LikeUseCase');

class LikesHandler {
  constructor(container) {
    this._container = container;
    this.putLikeHandler = this.putLikeHandler.bind(this);
  }

  async putLikeHandler(request, h) {
    const { threadId, commentId } = request.params;
    const { id: credentialId } = request.auth.credentials;
    const likeUseCase = this._container.getInstance(LikeUseCase.name);
    await likeUseCase.updateLike(threadId, commentId, credentialId);

    const response = h.response({
      status: 'success',
    });
    response.code(200);
    return response;
  }
}

module.exports = LikesHandler;
