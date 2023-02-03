/* eslint-disable no-underscore-dangle */
const ThreadUseCase = require('../../../../Applications/use_case/ThreadUseCase');
const CommentUseCase = require('../../../../Applications/use_case/CommentUseCase');
const ReplyUseCase = require('../../../../Applications/use_case/ReplyUseCase');

class ThreadsHandler {
  constructor(container) {
    this._container = container;
    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.postCommentHandler = this.postCommentHandler.bind(this);
    this.deleteCommentByIdHandler = this.deleteCommentByIdHandler.bind(this);
    this.getThreadByIdHandler = this.getThreadByIdHandler.bind(this);
    this.postReplyHandler = this.postReplyHandler.bind(this);
    this.deleteReplyByIdHandler = this.deleteReplyByIdHandler.bind(this);
  }

  async postThreadHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;

    const threadUseCase = this._container.getInstance(ThreadUseCase.name);
    const addedThread = await threadUseCase.addThread(request.payload, credentialId);

    const response = h.response({
      status: 'success',
      data: {
        addedThread,
      },
    });
    response.code(201);
    return response;
  }

  async postCommentHandler(request, h) {
    const { threadId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    const threadUseCase = this._container.getInstance(ThreadUseCase.name);
    await threadUseCase.getThreadById(threadId);
    const commentUseCase = this._container.getInstance(CommentUseCase.name);
    const addedComment = await commentUseCase.addComment(request.payload, threadId, credentialId);

    const response = h.response({
      status: 'success',
      data: {
        addedComment,
      },
    });
    response.code(201);
    return response;
  }

  async deleteCommentByIdHandler(request, h) {
    const { threadId, commentId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    const threadUseCase = this._container.getInstance(ThreadUseCase.name);
    await threadUseCase.getThreadById(threadId);

    const commentUseCase = this._container.getInstance(CommentUseCase.name);
    await commentUseCase.deleteCommentById(commentId, credentialId);

    const response = h.response({
      status: 'success',
    });
    response.code(200);
    return response;
  }

  async getThreadByIdHandler(request, h) {
    const { threadId } = request.params;
    const threadUseCase = this._container.getInstance(ThreadUseCase.name);

    const thread = await threadUseCase.getThreadById(threadId);
    const response = h.response({
      status: 'success',
      data: {
        thread,
      },
    });
    response.code(200);
    return response;
  }

  async postReplyHandler(request, h) {
    const { threadId, commentId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    const threadUseCase = this._container.getInstance(ThreadUseCase.name);
    await threadUseCase.getThreadById(threadId);
    const commentUseCase = this._container.getInstance(CommentUseCase.name);
    await commentUseCase.getCommentById(commentId);
    const replyUseCase = this._container.getInstance(ReplyUseCase.name);
    const addedReply = await replyUseCase.addReply(
      request.payload, threadId, commentId, credentialId,
    );

    const response = h.response({
      status: 'success',
      data: {
        addedReply,
      },
    });
    response.code(201);
    return response;
  }

  async deleteReplyByIdHandler(request, h) {
    const { threadId, commentId, replyId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    const threadUseCase = this._container.getInstance(ThreadUseCase.name);
    await threadUseCase.getThreadById(threadId);

    const commentUseCase = this._container.getInstance(CommentUseCase.name);
    await commentUseCase.getCommentById(commentId);

    const replyUseCase = this._container.getInstance(ReplyUseCase.name);
    await replyUseCase.deleteReplyById(replyId, credentialId);

    const response = h.response({
      status: 'success',
    });
    response.code(200);
    return response;
  }
}

module.exports = ThreadsHandler;
