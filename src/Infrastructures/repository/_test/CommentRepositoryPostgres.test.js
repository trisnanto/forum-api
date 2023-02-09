/* eslint-disable max-len */
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment function', () => {
    it('should persist new comment', async () => {
      // Arrange
      const commentPayload = {
        content: 'New comment',
      };
      const fakeIdGenerator = () => '123'; // stub!
      const fakeThreadId = 'thread-123'; // stub!
      const fakeCredentialId = 'user-123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await UsersTableTestHelper.addUser({
        id: fakeCredentialId, username: 'New user',
      });
      await ThreadsTableTestHelper.addThread({
        id: fakeThreadId, title: 'New title', owner: fakeCredentialId,
      });
      await commentRepositoryPostgres.addComment(commentPayload, fakeThreadId, fakeCredentialId);

      // Assert
      const comment = await CommentsTableTestHelper.findCommentById('comment-123');
      expect(comment.id).toEqual('comment-123');
      expect(comment.thread_id).toEqual('thread-123');
      expect(comment.content).toEqual('New comment');
      expect(comment.owner).toEqual('user-123');
      expect(comment.is_delete).toEqual(false);
    });

    it('should return thread comment correctly', async () => {
      // Arrange
      const commentPayload = {
        content: 'New comment',
      };
      const fakeIdGenerator = () => '123'; // stub!
      const fakeThreadId = 'thread-123'; // stub!
      const fakeCredentialId = 'user-123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await UsersTableTestHelper.addUser({
        id: fakeCredentialId, username: 'New user',
      });
      await ThreadsTableTestHelper.addThread({
        id: fakeThreadId, title: 'New title', owner: fakeCredentialId,
      });
      const comment = await commentRepositoryPostgres.addComment(commentPayload, fakeThreadId, fakeCredentialId);

      // Assert
      expect(comment).toStrictEqual({
        id: 'comment-123',
        content: commentPayload.content,
        owner: fakeCredentialId,
      });
    });
  });

  describe('deleteCommentById function', () => {
    it('should return commentId when comment has been deleted', async () => {
      // Arrange
      const fakeIdGenerator = () => '123'; // stub!
      const fakeCredentialId = 'user-123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await UsersTableTestHelper.addUser({
        id: fakeCredentialId, username: 'New User',
      });
      await ThreadsTableTestHelper.addThread({ title: 'New title', owner: fakeCredentialId });
      await CommentsTableTestHelper.addComment({ content: 'New comment' });
      const deletedCommentId = await commentRepositoryPostgres.deleteCommentById('comment-123', fakeCredentialId);

      // Assert
      expect(deletedCommentId).toStrictEqual('comment-123');
    });

    it('should return is_delete = true when comment has been deleted', async () => {
      // Arrange
      const fakeIdGenerator = () => '123'; // stub!
      const fakeCredentialId = 'user-123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await UsersTableTestHelper.addUser({
        id: fakeCredentialId, username: 'New User',
      });
      await ThreadsTableTestHelper.addThread({ title: 'New title', owner: fakeCredentialId });
      await CommentsTableTestHelper.addComment({ content: 'New comment' });
      await commentRepositoryPostgres.deleteCommentById('comment-123', fakeCredentialId);
      const comment = await CommentsTableTestHelper.findCommentById('comment-123');
      // Assert
      expect(comment.is_delete).toEqual(true);
    });
  });

  describe('getCommentById function', () => {
    it('should return thread comment correctly', async () => {
    // Arrange
      const fakeIdGenerator = () => '123'; // stub!
      const fakeThreadId = 'thread-123';
      const fakeUserId = 'user-123';
      const fakeCommentId = 'comment-123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

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

      // Assert
      const comment = await commentRepositoryPostgres.getCommentById(fakeCommentId);
      expect(comment).toBeDefined();
      expect(comment).toStrictEqual({
        id: fakeCommentId,
        username: 'New user 1',
        date: comment.date,
        content: 'New comment',
        is_delete: false,
      });
    });
  });

  describe('getCommentsByThreadId function', () => {
    it('should return empty array when comments not found', async () => {
      // Arrange
      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action and assert
      const comments = await commentRepositoryPostgres.getCommentsByThreadId('xxx');
      expect(comments).toEqual([]);
    });

    it('should return thread comments correctly', async () => {
    // Arrange
      const fakeIdGenerator = () => '123'; // stub!
      const fakeThreadId = 'thread-123';
      const fakeUserId = 'user-123';
      const fakeCommentId1 = 'comment-123';
      const fakeCommentId2 = 'comment-456';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);
      const delay = (ms) => new Promise((res) => setTimeout(res, ms));

      // Action
      await UsersTableTestHelper.addUser({
        id: fakeUserId, username: 'New user 1',
      });
      await ThreadsTableTestHelper.addThread({
        id: fakeThreadId, owner: fakeUserId,
      });
      await CommentsTableTestHelper.addComment({
        id: fakeCommentId1, content: 'New comment 1', owner: fakeUserId,
      });
      await delay(500);
      await CommentsTableTestHelper.addComment({
        id: fakeCommentId2, content: 'New comment 2', owner: fakeUserId,
      });

      // Assert
      const comments = await commentRepositoryPostgres.getCommentsByThreadId(fakeThreadId);
      expect(comments).toBeDefined();
      expect(comments).toHaveLength(2);
      expect(comments[0]).toStrictEqual({
        id: fakeCommentId1,
        username: 'New user 1',
        date: comments[0].date,
        content: 'New comment 1',
        is_delete: false,
      });
      expect(comments[1]).toStrictEqual({
        id: fakeCommentId2,
        username: 'New user 1',
        date: comments[1].date,
        content: 'New comment 2',
        is_delete: false,
      });
    });
  });

  describe('verifyCommentId function', () => {
    it('should return NotFoundError when comment not found', async () => {
      // Arrange
      const fakeIdGenerator = () => '123'; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action and assert
      await expect(commentRepositoryPostgres.verifyCommentId('xxx'))
        .rejects.toThrowError(NotFoundError);
    });

    it('should return commentId correctly', async () => {
    // Arrange
      const fakeIdGenerator = () => '123'; // stub!
      const fakeThreadId = 'thread-123';
      const fakeUserId = 'user-123';
      const fakeCommentId = 'comment-123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

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

      // Assert
      const commentId = await commentRepositoryPostgres.verifyCommentId(fakeCommentId);
      expect(commentId).toBeDefined();
      expect(commentId).toEqual(fakeCommentId);
    });
  });

  describe('verifyCommentOwnership function', () => {
    it('should return AuthorizationError when not the owner of the comment', async () => {
      // Arrange
      const fakeIdGenerator = () => '123'; // stub!
      const fakeThreadId = 'thread-123';
      const fakeUserId = 'user-123';
      const fakeCommentId = 'comment-123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

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

      // Assert
      await expect(commentRepositoryPostgres.verifyCommentOwnership(fakeCommentId, 'wrong user'))
        .rejects.toThrowError(AuthorizationError);
    });

    it('should return ownerId correctly', async () => {
    // Arrange
      const fakeIdGenerator = () => '123'; // stub!
      const fakeThreadId = 'thread-123';
      const fakeUserId = 'user-123';
      const fakeCommentId = 'comment-123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

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

      // Assert
      const ownerId = await commentRepositoryPostgres.verifyCommentOwnership(fakeCommentId, fakeUserId);
      expect(ownerId).toBeDefined();
      expect(ownerId).toEqual(fakeUserId);
    });
  });
});
