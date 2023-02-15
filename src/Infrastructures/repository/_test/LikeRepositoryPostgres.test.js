/* eslint-disable max-len */
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const pool = require('../../database/postgres/pool');
const LikeRepositoryPostgres = require('../LikeRepositoryPostgres');

describe('LikeRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await LikesTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addLike function', () => {
    it('should persist new like', async () => {
      // Arrange
      const fakeIdGenerator = () => '123'; // stub!
      const fakeThreadId = 'thread-123'; // stub!
      const fakeCommentId = 'comment-123'; // stub!
      const fakeCredentialId = 'user-123'; // stub!
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator);

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
      const likeId = await likeRepositoryPostgres.addLike(fakeCommentId, fakeCredentialId);
      const addedLike = await LikesTableTestHelper.findLikeById(likeId);

      // Assert
      expect(addedLike.id).toEqual('like-123');
      expect(addedLike.comment_id).toEqual('comment-123');
      expect(addedLike.owner).toEqual('user-123');
    });
  });

  describe('deleteLikeById function', () => {
    it('should return undefined when like has been deleted', async () => {
      // Arrange
      const fakeIdGenerator = () => '123'; // stub!
      const fakeThreadId = 'thread-123'; // stub!
      const fakeCommentId = 'comment-123'; // stub!
      const fakeLikeId = 'like-123'; // stub!
      const fakeCredentialId = 'user-123'; // stub!
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await UsersTableTestHelper.addUser({
        id: fakeCredentialId, username: 'New User',
      });
      await ThreadsTableTestHelper.addThread({ id: fakeThreadId, title: 'New title', owner: fakeCredentialId });
      await CommentsTableTestHelper.addComment({ id: fakeCommentId, content: 'New comment', owner: fakeCredentialId });
      await LikesTableTestHelper.addLike({ id: fakeLikeId, commentId: fakeCommentId, owner: fakeCredentialId });
      await likeRepositoryPostgres.deleteLikeById(fakeLikeId);
      const deletedLike = await LikesTableTestHelper.findLikeById(fakeLikeId);

      // Assert
      expect(deletedLike).toBeUndefined();
    });
  });

  describe('isAlreadyLiked function', () => {
    it('should return likeId if already liked', async () => {
      // Arrange
      const fakeIdGenerator = () => '123';
      const fakeThreadId = 'thread-123';
      const fakeCommentId = 'comment-123';
      const fakeCredentialId = 'user-123';
      const fakeLikeId = 'like-123';
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator);

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
      await LikesTableTestHelper.addLike({ id: fakeLikeId, commentId: fakeCommentId, owner: fakeCredentialId });
      const isAlreadyLiked = await likeRepositoryPostgres.isAlreadyLiked(fakeCommentId, fakeCredentialId);

      // Assert
      expect(isAlreadyLiked).toEqual(fakeLikeId);
    });

    it('should return false if not already liked', async () => {
      // Arrange
      const fakeIdGenerator = () => '123';
      const fakeThreadId = 'thread-123';
      const fakeCommentId = 'comment-123';
      const fakeCredentialId = 'user-123';
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator);

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
      const isAlreadyLiked = await likeRepositoryPostgres.isAlreadyLiked(fakeCommentId, fakeCredentialId);

      // Assert
      expect(isAlreadyLiked).toEqual(false);
    });
  });
});
