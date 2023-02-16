/* eslint-disable max-len */
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const pool = require('../../database/postgres/pool');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('ReplyRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await RepliesTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addReply function', () => {
    it('should return comment reply correctly', async () => {
      // Arrange
      const replyPayload = {
        content: 'New reply',
      };
      const fakeIdGenerator = () => '123';
      const fakeThreadId = 'thread-123';
      const fakeCommentId = 'comment-123';
      const fakeCredentialId = 'user-123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await UsersTableTestHelper.addUser({
        id: fakeCredentialId, username: 'New user',
      });
      await ThreadsTableTestHelper.addThread({
        id: fakeThreadId, title: 'New title', owner: fakeCredentialId,
      });
      await CommentsTableTestHelper.addComment({
        id: fakeCommentId, content: 'New comment', owner: fakeCredentialId,
      });
      const reply = await replyRepositoryPostgres.addReply(replyPayload, fakeThreadId, fakeCommentId, fakeCredentialId);

      // Assert
      expect(reply).toStrictEqual({
        id: 'reply-123',
        content: replyPayload.content,
        owner: fakeCredentialId,
      });
    });

    it('should persist new reply', async () => {
      // Arrange
      const replyPayload = {
        content: 'New reply',
      };
      const fakeIdGenerator = () => '123';
      const fakeThreadId = 'thread-123';
      const fakeCommentId = 'comment-123';
      const fakeCredentialId = 'user-123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await UsersTableTestHelper.addUser({
        id: fakeCredentialId, username: 'New user',
      });
      await ThreadsTableTestHelper.addThread({
        id: fakeThreadId, title: 'New title', owner: fakeCredentialId,
      });
      await CommentsTableTestHelper.addComment({
        id: fakeCommentId, content: 'New comment', owner: fakeCredentialId,
      });
      await replyRepositoryPostgres.addReply(replyPayload, fakeThreadId, fakeCommentId, fakeCredentialId);

      // Assert
      const reply = await RepliesTableTestHelper.findReplyById('reply-123');
      expect(reply.id).toEqual('reply-123');
      expect(reply.thread_id).toEqual('thread-123');
      expect(reply.comment_id).toEqual('comment-123');
      expect(reply.content).toEqual('New reply');
      expect(reply.owner).toEqual('user-123');
      expect(reply.is_delete).toEqual(false);
    });
  });

  describe('deleteReplyById function', () => {
    it('should return replyId when comment has been deleted', async () => {
      // Arrange
      const fakeIdGenerator = () => '123';
      const fakeThreadId = 'thread-123';
      const fakeCommentId = 'comment-123';
      const fakeReplyId = 'reply-123';
      const fakeCredentialId = 'user-123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await UsersTableTestHelper.addUser({
        id: fakeCredentialId, username: 'New User',
      });
      await ThreadsTableTestHelper.addThread({ id: fakeThreadId, title: 'New title', owner: fakeCredentialId });
      await CommentsTableTestHelper.addComment({ id: fakeCommentId, content: 'New comment', owner: fakeCredentialId });
      await RepliesTableTestHelper.addReply({
        id: fakeReplyId, threadId: fakeThreadId, commentId: fakeCommentId, content: 'New reply', owner: fakeCredentialId,
      });
      const deletedReplyId = await replyRepositoryPostgres.deleteReplyById(fakeReplyId);

      // Assert
      expect(deletedReplyId).toStrictEqual(fakeReplyId);
    });

    it('should return is_delete = true when comment has been deleted', async () => {
      // Arrange
      const fakeIdGenerator = () => '123';
      const fakeThreadId = 'thread-123';
      const fakeCommentId = 'comment-123';
      const fakeReplyId = 'reply-123';
      const fakeCredentialId = 'user-123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await UsersTableTestHelper.addUser({
        id: fakeCredentialId, username: 'New User',
      });
      await ThreadsTableTestHelper.addThread({ id: fakeThreadId, title: 'New title', owner: fakeCredentialId });
      await CommentsTableTestHelper.addComment({ id: fakeCommentId, content: 'New comment', owner: fakeCredentialId });
      await RepliesTableTestHelper.addReply({
        id: fakeReplyId, threadId: fakeThreadId, commentId: fakeCommentId, content: 'New reply', owner: fakeCredentialId,
      });
      await replyRepositoryPostgres.deleteReplyById(fakeReplyId);

      // Assert
      const reply = await RepliesTableTestHelper.findReplyById(fakeReplyId);
      expect(reply.is_delete).toEqual(true);
    });
  });

  describe('getRepliesByThreadId function', () => {
    it('should return empty array when replies not found', async () => {
      // Arrange
      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action and assert
      const replies = await replyRepositoryPostgres.getRepliesByThreadId('xxx');
      expect(replies).toEqual([]);
    });

    it('should return comment replies correctly', async () => {
    // Arrange
      const fakeIdGenerator = () => '123';
      const fakeThreadId = 'thread-123';
      const fakeUserId = 'user-123';
      const fakeCommentId = 'comment-123';
      const fakeReplyId1 = 'reply-123';
      const fakeReplyId2 = 'reply-456';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);
      const delay = (ms) => new Promise((res) => setTimeout(res, ms));

      // Action
      await UsersTableTestHelper.addUser({
        id: fakeUserId, username: 'New user 1',
      });
      await ThreadsTableTestHelper.addThread({
        id: fakeThreadId, owner: fakeUserId,
      });
      await CommentsTableTestHelper.addComment({
        id: fakeCommentId, content: 'New comment', owner: fakeUserId,
      });
      await RepliesTableTestHelper.addReply({
        id: fakeReplyId1, threadId: fakeThreadId, commentId: fakeCommentId, content: 'New reply 1', owner: fakeUserId,
      });
      await delay(500);
      await RepliesTableTestHelper.addReply({
        id: fakeReplyId2, threadId: fakeThreadId, commentId: fakeCommentId, content: 'New reply 2', owner: fakeUserId,
      });

      // Assert
      const replies = await replyRepositoryPostgres.getRepliesByThreadId(fakeThreadId);
      expect(replies).toBeDefined();
      expect(replies).toHaveLength(2);
      expect(replies[0]).toStrictEqual({
        id: fakeReplyId1,
        comment_id: fakeCommentId,
        content: 'New reply 1',
        date: replies[0].date,
        username: 'New user 1',
        is_delete: false,
      });
      expect(replies[1]).toStrictEqual({
        id: fakeReplyId2,
        comment_id: fakeCommentId,
        content: 'New reply 2',
        date: replies[1].date,
        username: 'New user 1',
        is_delete: false,
      });
    });
  });

  describe('verifyReplyId function', () => {
    it('should return NotFoundError when reply not found', async () => {
      // Arrange
      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action and assert
      await expect(replyRepositoryPostgres.verifyReplyId('xxx', 'some owner'))
        .rejects.toThrowError(NotFoundError);
    });

    it('should return replyId correctly', async () => {
      // Arrange
      const fakeIdGenerator = () => '123';
      const fakeThreadId = 'thread-123';
      const fakeCommentId = 'comment-123';
      const fakeReplyId = 'reply-123';
      const fakeCredentialId = 'user-123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await UsersTableTestHelper.addUser({
        id: fakeCredentialId, username: 'New User',
      });
      await ThreadsTableTestHelper.addThread({ id: fakeThreadId, title: 'New title', owner: fakeCredentialId });
      await CommentsTableTestHelper.addComment({ id: fakeCommentId, content: 'New comment', owner: fakeCredentialId });
      await RepliesTableTestHelper.addReply({
        id: fakeReplyId, threadId: fakeThreadId, commentId: fakeCommentId, content: 'New reply', owner: fakeCredentialId,
      });

      // Assert
      const replyId = await replyRepositoryPostgres.verifyReplyId(fakeReplyId);
      expect(replyId).toBeDefined();
      expect(replyId).toEqual(fakeReplyId);
    });
  });

  describe('verifyReplyOwnership function', () => {
    it('should return AuthorizationError when wrong reply owner', async () => {
      // Arrange
      const fakeIdGenerator = () => '123';
      const fakeThreadId = 'thread-123';
      const fakeCommentId = 'comment-123';
      const fakeReplyId = 'reply-123';
      const fakeCredentialId = 'user-123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await UsersTableTestHelper.addUser({
        id: fakeCredentialId, username: 'New User',
      });
      await ThreadsTableTestHelper.addThread({ id: fakeThreadId, title: 'New title', owner: fakeCredentialId });
      await CommentsTableTestHelper.addComment({ id: fakeCommentId, content: 'New comment', owner: fakeCredentialId });
      await RepliesTableTestHelper.addReply({
        id: fakeReplyId, threadId: fakeThreadId, commentId: fakeCommentId, content: 'New reply', owner: fakeCredentialId,
      });

      // Assert
      await expect(replyRepositoryPostgres.verifyReplyOwnership(fakeReplyId, 'wrong owner'))
        .rejects.toThrowError(AuthorizationError);
    });

    it('should return ownerId correctly', async () => {
      // Arrange
      const fakeIdGenerator = () => '123';
      const fakeThreadId = 'thread-123';
      const fakeUserId = 'user-123';
      const fakeCredentialId = 'user-123';
      const fakeCommentId = 'comment-123';
      const fakeReplyId = 'reply-123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await UsersTableTestHelper.addUser({
        id: fakeUserId,
      });
      await ThreadsTableTestHelper.addThread({
        id: fakeThreadId, owner: fakeUserId,
      });
      await CommentsTableTestHelper.addComment({
        id: fakeCommentId, content: 'New comment', owner: fakeUserId,
      });
      await RepliesTableTestHelper.addReply({
        id: fakeReplyId, threadId: fakeThreadId, commentId: fakeCommentId, content: 'New reply', owner: fakeCredentialId,
      });

      // Assert
      const ownerId = await replyRepositoryPostgres.verifyReplyOwnership(fakeReplyId, fakeCredentialId);
      expect(ownerId).toBeDefined();
      expect(ownerId).toEqual(fakeCredentialId);
    });
  });
});
