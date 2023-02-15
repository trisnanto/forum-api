/* eslint-disable no-underscore-dangle */
const NewThread = require('../../Domains/threads/entities/NewThread');
const Comment = require('../../Domains/comments/entities/Comment');
const Reply = require('../../Domains/replies/entities/Reply');

class ThreadUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async addThread(useCasePayload, credentialId) {
    const newThread = new NewThread(useCasePayload);
    return this._threadRepository.addThread(newThread, credentialId);
  }

  async getThreadById(threadId) {
    await this._threadRepository.verifyThreadId(threadId);
    const thread = await this._threadRepository.getThreadById(threadId);

    const comments = await this._commentRepository.getCommentsByThreadId(threadId);
    // thread.comments = comments.map((comment) => {
    //   const modifiedComment = { ...comment };
    //   if (comment.is_delete) {
    //     modifiedComment.content = '**komentar telah dihapus**';
    //   }
    //   delete modifiedComment.is_delete;
    //   return modifiedComment;
    // });

    const replies = await this._replyRepository.getRepliesByThreadId(threadId);
    // thread.comments.forEach((comment, index) => {
    //   const commentReplies = replies.filter((reply) => comment.id === reply.comment_id);
    //   thread.comments[index].replies = commentReplies.map((reply) => {
    //     const modifiedReplies = { ...reply };
    //     if (reply.is_delete) {
    //       modifiedReplies.content = '**balasan telah dihapus**';
    //     }
    //     delete modifiedReplies.comment_id;
    //     delete modifiedReplies.is_delete;
    //     return modifiedReplies;
    //   });
    // });
    thread.comments = comments.map((comment) => {
      const commentReplies = replies
        .filter((reply) => comment.id === reply.comment_id)
        .map((reply) => new Reply(reply));
      return new Comment(comment, commentReplies);
    });

    return thread;
  }
}

module.exports = ThreadUseCase;
