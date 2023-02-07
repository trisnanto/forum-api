/* eslint-disable max-len */
const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads endpoint', () => {
  let accessToken = '';
  beforeEach(async () => {
    const newUser = {
      username: 'dicoding',
      password: 'secret',
      fullname: 'Dicoding Indonesia',
    };
    const server = await createServer(container);
    await server.inject({
      method: 'POST',
      url: '/users',
      payload: newUser,
    });
    const userLoginJSON = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: {
        username: 'dicoding',
        password: 'secret',
      },
    });
    const userLogin = JSON.parse(userLoginJSON.payload);
    accessToken = userLogin.data.accessToken;
  });

  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  describe('when POST /threads', () => {
    it('should response 201 and persisted thread', async () => {
      // Arrange
      const requestPayload = {
        title: 'New title',
        body: 'New body',
      };
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread).toBeDefined();
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const requestPayload = {
        title: 'New title',
      };
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const requestPayload = {
        title: 'New title',
        body: 12345,
      };
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena tipe data tidak sesuai');
    });
  });

  describe('when GET /threads/{threadId}', () => {
    it('should respon with 404 status if the thread is not found', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'GET',
        url: '/threads/xxx',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Thread tidak ditemukan');
    });

    it('should respon with 200 status with complete thread details', async () => {
      // Arrange
      const fakeUserId = 'user-123';
      const fakeUserCommentedId1 = 'user-456';
      const fakeUserCommentedId2 = 'user-789';
      const fakeThreadId = 'thread-123';
      const fakeCommentId1 = 'comment-123';
      const fakeCommentId2 = 'comment-456';
      const fakeReplyId1 = 'reply-123';
      const fakeReplyId2 = 'reply-456';
      const delay = (ms) => new Promise((res) => setTimeout(res, ms));
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
      await CommentsTableTestHelper.deleteCommentById(fakeCommentId2);
      await RepliesTableTestHelper.addReply({
        id: fakeReplyId1, threadId: fakeThreadId, commentId: fakeCommentId1, content: 'New reply 1', owner: fakeUserId,
      });
      // memberi jeda antara balasan pertama dan kedua
      await delay(500);
      await RepliesTableTestHelper.addReply({
        id: fakeReplyId2, threadId: fakeThreadId, commentId: fakeCommentId1, content: 'New reply 2', owner: fakeUserId,
      });
      await RepliesTableTestHelper.deleteReplyById(fakeReplyId2);
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${fakeThreadId}`,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should respon with 200 status, thread only', async () => {
      // Arrange
      const fakeUserId = 'user-123';
      const fakeThreadId = 'thread-123';
      await UsersTableTestHelper.addUser({
        id: fakeUserId, username: 'New user 1',
      });
      await ThreadsTableTestHelper.addThread({
        id: fakeThreadId, title: 'New title', owner: fakeUserId,
      });
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${fakeThreadId}`,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should respon with 200 status, -----', async () => {
      // Arrange
      const fakeUserId = 'user-123';
      const fakeUserCommentedId1 = 'user-456';
      const fakeThreadId = 'thread-123';
      const fakeCommentId1 = 'comment-123';
      const fakeCommentId2 = 'comment-456';
      const fakeCommentId3 = 'comment-789';
      const fakeReplyId1 = 'reply-123';
      const fakeReplyId2 = 'reply-456';
      const delay = (ms) => new Promise((res) => setTimeout(res, ms));

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
      await CommentsTableTestHelper.deleteCommentById(fakeCommentId3);
      await RepliesTableTestHelper.addReply({
        id: fakeReplyId1, threadId: fakeThreadId, commentId: fakeCommentId1, content: 'New reply for comment 1', owner: fakeUserId,
      });
      // memberi jeda antara balasan pertama dan kedua
      await delay(500);
      await RepliesTableTestHelper.addReply({
        id: fakeReplyId2, threadId: fakeThreadId, commentId: fakeCommentId2, content: 'New reply for comment 2', owner: fakeUserId,
      });
      await RepliesTableTestHelper.deleteReplyById(fakeReplyId2);
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${fakeThreadId}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });
  });
});
