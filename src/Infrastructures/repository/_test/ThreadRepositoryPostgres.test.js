/* eslint-disable max-len */
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const NewThread = require('../../../Domains/threads/entities/NewThread');
const ForumThread = require('../../../Domains/threads/entities/ForumThread');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
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

  describe('addThread function', () => {
    it('should persist new thread and return forum thread correctly', async () => {
      // Arrange
      const newThread = new NewThread({
        title: 'A title',
        body: 'A body',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const fakeCredentialId = 'user-123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await UsersTableTestHelper.addUser({
        id: 'user-123', username: 'New User',
      });
      await threadRepositoryPostgres.addThread(newThread, fakeCredentialId);

      // Assert
      const threads = await ThreadsTableTestHelper.findThreadsById('thread-123');
      expect(threads).toHaveLength(1);
    });

    it('should return forum thread correctly', async () => {
      // Arrange
      const newThread = new NewThread({
        title: 'A title',
        body: 'A body',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const fakeCredentialId = 'user-123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await UsersTableTestHelper.addUser({
        id: 'user-123', username: 'New User',
      });
      const forumThread = await threadRepositoryPostgres.addThread(newThread, fakeCredentialId);

      // Assert
      expect(forumThread).toStrictEqual(new ForumThread({
        id: 'thread-123',
        title: 'A title',
        owner: fakeCredentialId,
      }));
    });
  });

  describe('getThreadById function', () => {
    it('should return NotFoundError when thread not found', async () => {
      // Arrange
      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action and assert
      await expect(threadRepositoryPostgres.getThreadById('xxx'))
        .rejects.toThrowError(NotFoundError);
    });

    it('should return forum thread with no comments correctly', async () => {
      // Arrange
      const fakeIdGenerator = () => '123'; // stub!
      const fakeUserId = 'user-123';
      const fakeThreadId = 'thread-123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await UsersTableTestHelper.addUser({
        id: fakeUserId, username: 'New user 1',
      });
      await ThreadsTableTestHelper.addThread({
        id: fakeThreadId, title: 'New title', owner: fakeUserId,
      });

      // Assert
      const thread = await threadRepositoryPostgres.getThreadById(fakeThreadId);
      expect(thread).toBeDefined();
    });

    it('should return forum thread with one comment correctly', async () => {
      // Arrange
      const fakeIdGenerator = () => '123'; // stub!
      const fakeUserId = 'user-123';
      const fakeUserCommentedId1 = 'user-456';
      const fakeThreadId = 'thread-123';
      const fakeCommentId1 = 'comment-123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await UsersTableTestHelper.addUser({
        id: fakeUserId, username: 'New user 1',
      });
      await UsersTableTestHelper.addUser({
        id: fakeUserCommentedId1, username: 'New user 2',
      });
      await ThreadsTableTestHelper.addThread({
        id: fakeThreadId, title: 'New title', owner: fakeUserId,
      });
      await CommentsTableTestHelper.addComment({
        id: fakeCommentId1, threadId: fakeThreadId, content: 'New comment 1', owner: fakeUserCommentedId1,
      });

      // Assert
      const thread = await threadRepositoryPostgres.getThreadById(fakeThreadId);
      expect(thread).toBeDefined();
      expect(thread.comments).toHaveLength(1);
    });

    it('should return forum thread with deleted comment correctly', async () => {
      // Arrange
      const fakeIdGenerator = () => '123'; // stub!
      const fakeUserId = 'user-123';
      const fakeUserCommentedId1 = 'user-456';
      const fakeThreadId = 'thread-123';
      const fakeCommentId1 = 'comment-123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await UsersTableTestHelper.addUser({
        id: fakeUserId, username: 'New user 1',
      });
      await UsersTableTestHelper.addUser({
        id: fakeUserCommentedId1, username: 'New user 2',
      });
      await ThreadsTableTestHelper.addThread({
        id: fakeThreadId, title: 'New title', owner: fakeUserId,
      });
      await CommentsTableTestHelper.addComment({
        id: fakeCommentId1, threadId: fakeThreadId, content: 'New comment 1', owner: fakeUserCommentedId1,
      });
      await CommentsTableTestHelper.deleteCommentByIdById(fakeCommentId1);

      // Assert
      const thread = await threadRepositoryPostgres.getThreadById(fakeThreadId);
      expect(thread).toBeDefined();
      expect(thread.comments).toHaveLength(1);
      expect(thread.comments[0].content).toEqual('**komentar telah dihapus**');
    });

    it('should return forum thread with one comment and one reply correctly', async () => {
      // Arrange
      const fakeIdGenerator = () => '123'; // stub!
      const fakeUserId = 'user-123';
      const fakeUserCommentedId1 = 'user-456';
      const fakeThreadId = 'thread-123';
      const fakeCommentId1 = 'comment-123';
      const fakeReplyId1 = 'reply-123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await UsersTableTestHelper.addUser({
        id: fakeUserId, username: 'New user 1',
      });
      await UsersTableTestHelper.addUser({
        id: fakeUserCommentedId1, username: 'New user 2',
      });
      await ThreadsTableTestHelper.addThread({
        id: fakeThreadId, title: 'New title', owner: fakeUserId,
      });
      await CommentsTableTestHelper.addComment({
        id: fakeCommentId1, threadId: fakeThreadId, content: 'New comment 1', owner: fakeUserCommentedId1,
      });
      await RepliesTableTestHelper.addReply({
        id: fakeReplyId1, threadId: fakeThreadId, commentId: fakeCommentId1, content: 'New reply 1', owner: fakeUserId,
      });

      // Assert
      const thread = await threadRepositoryPostgres.getThreadById(fakeThreadId);
      expect(thread).toBeDefined();
      expect(thread.comments).toHaveLength(1);
      expect(thread.comments[0].replies).toHaveLength(1);
    });

    it('should return forum thread with one comment and one deleted reply correctly', async () => {
      // Arrange
      const fakeIdGenerator = () => '123'; // stub!
      const fakeUserId = 'user-123';
      const fakeUserCommentedId1 = 'user-456';
      const fakeThreadId = 'thread-123';
      const fakeCommentId1 = 'comment-123';
      const fakeReplyId1 = 'reply-123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await UsersTableTestHelper.addUser({
        id: fakeUserId, username: 'New user 1',
      });
      await UsersTableTestHelper.addUser({
        id: fakeUserCommentedId1, username: 'New user 2',
      });
      await ThreadsTableTestHelper.addThread({
        id: fakeThreadId, title: 'New title', owner: fakeUserId,
      });
      await CommentsTableTestHelper.addComment({
        id: fakeCommentId1, threadId: fakeThreadId, content: 'New comment 1', owner: fakeUserCommentedId1,
      });
      await RepliesTableTestHelper.addReply({
        id: fakeReplyId1, threadId: fakeThreadId, commentId: fakeCommentId1, content: 'New reply 1', owner: fakeUserId,
      });
      await RepliesTableTestHelper.deleteReplyByIdById(fakeReplyId1);

      // Assert
      const thread = await threadRepositoryPostgres.getThreadById(fakeThreadId);
      expect(thread).toBeDefined();
      expect(thread.comments).toHaveLength(1);
      expect(thread.comments[0].replies).toHaveLength(1);
      expect(thread.comments[0].replies[0].content).toEqual('**balasan telah dihapus**');
    });

    it('should return forum thread with one comment and two reply correctly', async () => {
      // Arrange
      const fakeIdGenerator = () => '123'; // stub!
      const fakeUserId = 'user-123';
      const fakeUserCommentedId1 = 'user-456';
      const fakeThreadId = 'thread-123';
      const fakeCommentId1 = 'comment-123';
      const fakeReplyId1 = 'reply-123';
      const fakeReplyId2 = 'reply-456';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);
      const delay = (ms) => new Promise((res) => setTimeout(res, ms));

      // Action
      await UsersTableTestHelper.addUser({
        id: fakeUserId, username: 'New user 1',
      });
      await UsersTableTestHelper.addUser({
        id: fakeUserCommentedId1, username: 'New user 2',
      });
      await ThreadsTableTestHelper.addThread({
        id: fakeThreadId, title: 'New title', owner: fakeUserId,
      });
      await CommentsTableTestHelper.addComment({
        id: fakeCommentId1, threadId: fakeThreadId, content: 'New comment 1', owner: fakeUserCommentedId1,
      });
      await RepliesTableTestHelper.addReply({
        id: fakeReplyId1, threadId: fakeThreadId, commentId: fakeCommentId1, content: 'New reply 1', owner: fakeUserId,
      });
      // memberi jeda antara balasan pertama dan kedua
      await delay(500);
      await RepliesTableTestHelper.addReply({
        id: fakeReplyId2, threadId: fakeThreadId, commentId: fakeCommentId1, content: 'New reply 2', owner: fakeUserId,
      });

      // Assert
      const thread = await threadRepositoryPostgres.getThreadById(fakeThreadId);
      expect(thread).toBeDefined();
      expect(thread.comments).toHaveLength(1);
      expect(thread.comments[0].replies).toHaveLength(2);
    });

    it('should return forum thread with two comment and one reply each comment correctly', async () => {
      // Arrange
      const fakeIdGenerator = () => '123'; // stub!
      const fakeUserId = 'user-123';
      const fakeUserCommentedId1 = 'user-456';
      const fakeThreadId = 'thread-123';
      const fakeCommentId1 = 'comment-123';
      const fakeCommentId2 = 'comment-456';
      const fakeReplyId1 = 'reply-123';
      const fakeReplyId2 = 'reply-456';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);
      const delay = (ms) => new Promise((res) => setTimeout(res, ms));

      // Action
      await UsersTableTestHelper.addUser({
        id: fakeUserId, username: 'New user 1',
      });
      await UsersTableTestHelper.addUser({
        id: fakeUserCommentedId1, username: 'New user 2',
      });
      await ThreadsTableTestHelper.addThread({
        id: fakeThreadId, title: 'New title', owner: fakeUserId,
      });
      await CommentsTableTestHelper.addComment({
        id: fakeCommentId1, threadId: fakeThreadId, content: 'New comment 1', owner: fakeUserCommentedId1,
      });
      // memberi jeda antara komentar pertama dan kedua
      await delay(500);
      await CommentsTableTestHelper.addComment({
        id: fakeCommentId2, threadId: fakeThreadId, content: 'New comment 2', owner: fakeUserCommentedId1,
      });
      await RepliesTableTestHelper.addReply({
        id: fakeReplyId1, threadId: fakeThreadId, commentId: fakeCommentId1, content: 'New reply for comment 1', owner: fakeUserId,
      });
      // memberi jeda antara balasan pertama dan kedua
      await delay(500);
      await RepliesTableTestHelper.addReply({
        id: fakeReplyId2, threadId: fakeThreadId, commentId: fakeCommentId2, content: 'New reply for comment 2', owner: fakeUserId,
      });

      // Assert
      const thread = await threadRepositoryPostgres.getThreadById(fakeThreadId);
      expect(thread).toBeDefined();
      expect(thread.comments).toHaveLength(2);
      expect(thread.comments[0].replies).toHaveLength(1);
      expect(thread.comments[1].replies).toHaveLength(1);
    });

    it('should return forum thread with three comment and one reply for comment 1 and one reply for comment 2 correctly', async () => {
      // Arrange
      const fakeIdGenerator = () => '123'; // stub!
      const fakeUserId = 'user-123';
      const fakeUserCommentedId1 = 'user-456';
      const fakeThreadId = 'thread-123';
      const fakeCommentId1 = 'comment-123';
      const fakeCommentId2 = 'comment-456';
      const fakeCommentId3 = 'comment-789';
      const fakeReplyId1 = 'reply-123';
      const fakeReplyId2 = 'reply-456';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);
      const delay = (ms) => new Promise((res) => setTimeout(res, ms));

      // Action
      await UsersTableTestHelper.addUser({
        id: fakeUserId, username: 'New user 1',
      });
      await UsersTableTestHelper.addUser({
        id: fakeUserCommentedId1, username: 'New user 2',
      });
      await ThreadsTableTestHelper.addThread({
        id: fakeThreadId, title: 'New title', owner: fakeUserId,
      });
      await CommentsTableTestHelper.addComment({
        id: fakeCommentId1, threadId: fakeThreadId, content: 'New comment 1', owner: fakeUserCommentedId1,
      });
      // memberi jeda antara komentar pertama dan kedua
      await delay(500);
      await CommentsTableTestHelper.addComment({
        id: fakeCommentId2, threadId: fakeThreadId, content: 'New comment 2', owner: fakeUserCommentedId1,
      });
      // memberi jeda antara komentar kedua dan ketiga
      await delay(500);
      await CommentsTableTestHelper.addComment({
        id: fakeCommentId3, threadId: fakeThreadId, content: 'New comment 3', owner: fakeUserCommentedId1,
      });
      await RepliesTableTestHelper.addReply({
        id: fakeReplyId1, threadId: fakeThreadId, commentId: fakeCommentId1, content: 'New reply for comment 1', owner: fakeUserId,
      });
      // memberi jeda antara balasan pertama dan kedua
      await delay(500);
      await RepliesTableTestHelper.addReply({
        id: fakeReplyId2, threadId: fakeThreadId, commentId: fakeCommentId2, content: 'New reply for comment 2', owner: fakeUserId,
      });

      // Assert
      const thread = await threadRepositoryPostgres.getThreadById(fakeThreadId);
      expect(thread).toBeDefined();
      expect(thread.comments).toHaveLength(3);
      expect(thread.comments[0].replies).toHaveLength(1);
      expect(thread.comments[1].replies).toHaveLength(1);
      expect(thread.comments[2].replies).toHaveLength(0);
    });

    it('should return forum thread correctly', async () => {
      // Arrange
      const fakeIdGenerator = () => '123'; // stub!
      const fakeUserId = 'user-123';
      const fakeUserCommentedId1 = 'user-456';
      const fakeUserCommentedId2 = 'user-789';
      const fakeThreadId = 'thread-123';
      const fakeCommentId1 = 'comment-123';
      const fakeCommentId2 = 'comment-456';
      const fakeReplyId1 = 'reply-123';
      const fakeReplyId2 = 'reply-456';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);
      const delay = (ms) => new Promise((res) => setTimeout(res, ms));

      // Action
      await UsersTableTestHelper.addUser({
        id: fakeUserId, username: 'New user 1',
      });
      await UsersTableTestHelper.addUser({
        id: fakeUserCommentedId1, username: 'New user 2',
      });
      await UsersTableTestHelper.addUser({
        id: fakeUserCommentedId2, username: 'New user 3',
      });
      await ThreadsTableTestHelper.addThread({
        id: fakeThreadId, title: 'New title', owner: fakeUserId,
      });
      await CommentsTableTestHelper.addComment({
        id: fakeCommentId1, threadId: fakeThreadId, content: 'New comment 1', owner: fakeUserCommentedId1,
      });
      // memberi jeda antara komentar pertama dan kedua
      await delay(500);
      await CommentsTableTestHelper.addComment({
        id: fakeCommentId2, threadId: fakeThreadId, content: 'New comment 2', owner: fakeUserCommentedId2,
      });
      await CommentsTableTestHelper.deleteCommentByIdById(fakeCommentId2);
      await RepliesTableTestHelper.addReply({
        id: fakeReplyId1, threadId: fakeThreadId, commentId: fakeCommentId1, content: 'New reply 1', owner: fakeUserId,
      });
      // memberi jeda antara balasan pertama dan kedua
      await delay(500);
      await RepliesTableTestHelper.addReply({
        id: fakeReplyId2, threadId: fakeThreadId, commentId: fakeCommentId1, content: 'New reply 2', owner: fakeUserId,
      });
      await RepliesTableTestHelper.deleteReplyByIdById(fakeReplyId2);

      // Assert
      const thread = await threadRepositoryPostgres.getThreadById(fakeThreadId);
      expect(thread).toBeDefined();
      expect(thread.comments[1].content).toEqual('**komentar telah dihapus**');
      expect(thread.comments[0].replies[1].content).toEqual('**balasan telah dihapus**');
    });
  });

  describe('addComment function', () => {
    it('should persist new comment and return thread comment correctly', async () => {
      // Arrange
      const commentPayload = {
        content: 'New comment',
      };
      const fakeIdGenerator = () => '123'; // stub!
      const fakeThreadId = 'thread-123'; // stub!
      const fakeCredentialId = 'user-123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await UsersTableTestHelper.addUser({
        id: fakeCredentialId, username: 'New user',
      });
      await ThreadsTableTestHelper.addThread({
        id: fakeThreadId, title: 'New title', owner: fakeCredentialId,
      });
      await threadRepositoryPostgres.addComment(commentPayload, fakeThreadId, fakeCredentialId);

      // Assert
      const comment = await CommentsTableTestHelper.findCommentById('comment-123');
      expect(comment).toHaveLength(1);
    });

    it('should return thread comment correctly', async () => {
      // Arrange
      const commentPayload = {
        content: 'New comment',
      };
      const fakeIdGenerator = () => '123'; // stub!
      const fakeThreadId = 'thread-123'; // stub!
      const fakeCredentialId = 'user-123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await UsersTableTestHelper.addUser({
        id: fakeCredentialId, username: 'New user',
      });
      await ThreadsTableTestHelper.addThread({
        id: fakeThreadId, title: 'New title', owner: fakeCredentialId,
      });
      const comment = await threadRepositoryPostgres.addComment(commentPayload, fakeThreadId, fakeCredentialId);

      // Assert
      expect(comment).toStrictEqual({
        id: 'comment-123',
        content: commentPayload.content,
        owner: fakeCredentialId,
      });
    });
  });

  describe('deleteCommentById function', () => {
    it('should return NotFoundError when comment not found', async () => {
      // Arrange
      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action and assert
      await expect(threadRepositoryPostgres.deleteCommentById('xxx', 'some owner'))
        .rejects.toThrowError(NotFoundError);
    });

    it('should return AuthorizationError when wrong comment owner', async () => {
      // Arrange
      const fakeIdGenerator = () => '123'; // stub!
      const fakeCredentialId = 'user-123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await UsersTableTestHelper.addUser({
        id: fakeCredentialId, username: 'New User',
      });
      await ThreadsTableTestHelper.addThread({ title: 'New title', owner: fakeCredentialId });
      await CommentsTableTestHelper.addComment({ content: 'New comment' });

      // Assert
      await expect(threadRepositoryPostgres.deleteCommentById('comment-123', 'wrong owner'))
        .rejects.toThrowError(AuthorizationError);
    });

    it('should return commentId when comment has been deleted', async () => {
      // Arrange
      const fakeIdGenerator = () => '123'; // stub!
      const fakeCredentialId = 'user-123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await UsersTableTestHelper.addUser({
        id: fakeCredentialId, username: 'New User',
      });
      await ThreadsTableTestHelper.addThread({ title: 'New title', owner: fakeCredentialId });
      await CommentsTableTestHelper.addComment({ content: 'New comment' });
      const deletedCommentId = await threadRepositoryPostgres.deleteCommentById('comment-123', fakeCredentialId);

      // Assert
      expect(deletedCommentId).toStrictEqual('comment-123');
    });
  });

  describe('getCommentById function', () => {
    it('should return NotFoundError when thread not found', async () => {
      // Arrange
      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action and assert
      await expect(threadRepositoryPostgres.getCommentById('xxx'))
        .rejects.toThrowError(NotFoundError);
    });

    it('should return forum thread correctly', async () => {
    // Arrange
      const fakeIdGenerator = () => '123'; // stub!
      const fakeThreadId = 'thread-123';
      const fakeUserId = 'user-123';
      const fakeCommentId = 'comment-123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

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
      const comment = await threadRepositoryPostgres.getCommentById(fakeCommentId);
      expect(comment).toBeDefined();
    });
  });

  describe('addReply function', () => {
    it('should return comment reply correctly', async () => {
      // Arrange
      const replyPayload = {
        content: 'New reply',
      };
      const fakeIdGenerator = () => '123'; // stub!
      const fakeThreadId = 'thread-123'; // stub!
      const fakeCommentId = 'comment-123'; // stub!
      const fakeCredentialId = 'user-123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

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
      const reply = await threadRepositoryPostgres.addReply(replyPayload, fakeThreadId, fakeCommentId, fakeCredentialId);

      // Assert
      expect(reply).toStrictEqual({
        id: 'reply-123',
        content: replyPayload.content,
        owner: fakeCredentialId,
      });
    });

    it('should persist new reply and return comment reply correctly', async () => {
      // Arrange
      const replyPayload = {
        content: 'New reply',
      };
      const fakeIdGenerator = () => '123'; // stub!
      const fakeThreadId = 'thread-123'; // stub!
      const fakeCommentId = 'comment-123'; // stub!
      const fakeCredentialId = 'user-123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

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
      await threadRepositoryPostgres.addReply(replyPayload, fakeThreadId, fakeCommentId, fakeCredentialId);

      // Assert
      const reply = await RepliesTableTestHelper.findReplyById('reply-123');
      expect(reply).toHaveLength(1);
    });
  });

  describe('deleteReplyById function', () => {
    it('should return NotFoundError when reply not found', async () => {
      // Arrange
      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action and assert
      await expect(threadRepositoryPostgres.deleteReplyById('xxx', 'some thread', 'some comment', 'some owner'))
        .rejects.toThrowError(NotFoundError);
    });

    it('should return AuthorizationError when wrong reply owner', async () => {
      // Arrange
      const fakeIdGenerator = () => '123'; // stub!
      const fakeThreadId = 'thread-123'; // stub!
      const fakeCommentId = 'comment-123'; // stub!
      const fakeReplyId = 'reply-123'; // stub!
      const fakeCredentialId = 'user-123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

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
      await expect(threadRepositoryPostgres.deleteReplyById('reply-123', 'wrong owner'))
        .rejects.toThrowError(AuthorizationError);
    });

    it('should return replyId when comment has been deleted', async () => {
      // Arrange
      const fakeIdGenerator = () => '123'; // stub!
      const fakeThreadId = 'thread-123'; // stub!
      const fakeCommentId = 'comment-123'; // stub!
      const fakeReplyId = 'reply-123'; // stub!
      const fakeCredentialId = 'user-123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await UsersTableTestHelper.addUser({
        id: fakeCredentialId, username: 'New User',
      });
      await ThreadsTableTestHelper.addThread({ id: fakeThreadId, title: 'New title', owner: fakeCredentialId });
      await CommentsTableTestHelper.addComment({ id: fakeCommentId, content: 'New comment', owner: fakeCredentialId });
      await RepliesTableTestHelper.addReply({
        id: fakeReplyId, threadId: fakeThreadId, commentId: fakeCommentId, content: 'New reply', owner: fakeCredentialId,
      });
      const deletedReplyId = await threadRepositoryPostgres.deleteReplyById('reply-123', fakeCredentialId);

      // Assert
      expect(deletedReplyId).toStrictEqual('reply-123');
    });
  });
});
