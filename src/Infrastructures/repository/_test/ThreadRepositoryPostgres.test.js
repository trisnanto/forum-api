/* eslint-disable max-len */
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const NewThread = require('../../../Domains/threads/entities/NewThread');
const ForumThread = require('../../../Domains/threads/entities/ForumThread');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

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
    it('should return forum thread correctly', async () => {
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
        id: fakeThreadId, title: 'New title', body: 'New body', owner: fakeUserId,
      });

      // Assert
      const thread = await threadRepositoryPostgres.getThreadById(fakeThreadId);
      expect(thread).toBeDefined();
      expect(thread).toStrictEqual({
        id: fakeThreadId,
        title: 'New title',
        body: 'New body',
        date: thread.date,
        username: 'New user 1',
      });
    });
  });

  describe('verifyThreadId function', () => {
    it('should return NotFoundError when threadId not found', async () => {
      // Arrange
      const fakeIdGenerator = () => '123'; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action and assert
      await expect(threadRepositoryPostgres.verifyThreadId('xxx'))
        .rejects.toThrowError(NotFoundError);
    });

    it('should return threadId if founded', async () => {
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
      const threadId = await threadRepositoryPostgres.verifyThreadId(fakeThreadId);
      expect(threadId).toBeDefined();
      expect(threadId).toEqual(fakeThreadId);
    });
  });
});
