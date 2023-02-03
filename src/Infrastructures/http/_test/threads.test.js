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
  let registeredUserId = '';
  beforeEach(async () => {
    const newUser = {
      username: 'dicoding',
      password: 'secret',
      fullname: 'Dicoding Indonesia',
    };
    const server = await createServer(container);
    const registeredUserJSON = await server.inject({
      method: 'POST',
      url: '/users',
      payload: newUser,
    });
    const registeredUser = JSON.parse(registeredUserJSON.payload);
    registeredUserId = registeredUser.data.addedUser.id;
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
  });

  describe('when POST /threads/{threadId}/comments', () => {
    it('should response 201 and persisted comment', async () => {
      // Arrange
      const requestPayload = {
        content: 'New comment',
      };
      const fakeThreadId = 'thread-123';
      const server = await createServer(container);
      await ThreadsTableTestHelper.addThread({
        id: fakeThreadId, title: 'New title', owner: registeredUserId,
      });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${fakeThreadId}/comments`,
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment).toBeDefined();
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const fakeThreadId = 'thread-123';
      const server = await createServer(container);
      await ThreadsTableTestHelper.addThread({
        id: fakeThreadId, title: 'New title', owner: registeredUserId,
      });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${fakeThreadId}/comments`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat komentar baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const requestPayload = {
        content: 12345,
      };
      const fakeThreadId = 'thread-123';
      const server = await createServer(container);
      await ThreadsTableTestHelper.addThread({
        id: fakeThreadId, title: 'New title', owner: registeredUserId,
      });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${fakeThreadId}/comments`,
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat komentar baru karena tipe data tidak sesuai');
    });

    it('should response 404 when thread not found', async () => {
      // Arrange
      const requestPayload = {
        content: 'New comment',
      };
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/xxx/comments',
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Thread tidak ditemukan');
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should response 404 when thread not found', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/xxx/comments/xxx',
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Thread tidak ditemukan');
    });

    it('should response 404 when comment not found', async () => {
      // Arrange
      const fakeThreadId = 'thread-123';
      const fakeCommentId = 'comment-123';
      await ThreadsTableTestHelper.addThread({
        id: fakeThreadId, title: 'New title', owner: registeredUserId,
      });
      await CommentsTableTestHelper.addComment({
        id: fakeCommentId, threadId: fakeThreadId, content: 'New comment', owner: registeredUserId,
      });
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${fakeThreadId}/comments/xxx`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Komentar tidak ditemukan');
    });

    it('should response 200', async () => {
      // Arrange
      const fakeThreadId = 'thread-123';
      const fakeCommentId = 'comment-123';
      await ThreadsTableTestHelper.addThread({
        id: fakeThreadId, title: 'New title', owner: registeredUserId,
      });
      await CommentsTableTestHelper.addComment({
        id: fakeCommentId, threadId: fakeThreadId, content: 'New comment', owner: registeredUserId,
      });
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${fakeThreadId}/comments/${fakeCommentId}`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });
  });

  describe('when POST /threads/{threadId}/comments/{commentId}/replies', () => {
    it('should response 201 and persisted reply', async () => {
      // Arrange
      const requestPayload = {
        content: 'New reply',
      };
      const fakeThreadId = 'thread-123';
      const fakeCommentId = 'comment-123';
      const server = await createServer(container);
      await ThreadsTableTestHelper.addThread({
        id: fakeThreadId, title: 'New title', owner: registeredUserId,
      });
      await CommentsTableTestHelper.addComment({
        id: fakeCommentId, content: 'New comment', owner: registeredUserId,
      });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${fakeThreadId}/comments/${fakeCommentId}/replies`,
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedReply).toBeDefined();
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const fakeThreadId = 'thread-123';
      const fakeCommentId = 'comment-123';
      const server = await createServer(container);
      await ThreadsTableTestHelper.addThread({
        id: fakeThreadId, title: 'New title', owner: registeredUserId,
      });
      await CommentsTableTestHelper.addComment({
        id: fakeCommentId, content: 'New comment', owner: registeredUserId,
      });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${fakeThreadId}/comments/${fakeCommentId}/replies`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat balasan baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const requestPayload = {
        content: 12345,
      };
      const fakeThreadId = 'thread-123';
      const fakeCommentId = 'comment-123';
      const server = await createServer(container);
      await ThreadsTableTestHelper.addThread({
        id: fakeThreadId, title: 'New title', owner: registeredUserId,
      });
      await CommentsTableTestHelper.addComment({
        id: fakeCommentId, content: 'New comment', owner: registeredUserId,
      });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${fakeThreadId}/comments/${fakeCommentId}/replies`,
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat balasan baru karena tipe data tidak sesuai');
    });

    it('should response 404 when thread not found', async () => {
      // Arrange
      const requestPayload = {
        content: 'New comment',
      };
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/xxx/comments/xxx/replies',
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Thread tidak ditemukan');
    });

    it('should response 404 when comment not found', async () => {
      // Arrange
      const requestPayload = {
        content: 'New comment',
      };
      const fakeThreadId = 'thread-123';
      await ThreadsTableTestHelper.addThread({
        id: fakeThreadId, title: 'New title', owner: registeredUserId,
      });
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${fakeThreadId}/comments/xxx/replies`,
        payload: requestPayload,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Komentar tidak ditemukan');
    });

    it('should response 403 when no authorization provided', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/xxx/comments/xxx/replies',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}', () => {
    it('should response 404 when thread not found', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/xxx/comments/xxx/replies/xxx',
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Thread tidak ditemukan');
    });

    it('should response 404 when comment not found', async () => {
      // Arrange
      const fakeThreadId = 'thread-123';
      await ThreadsTableTestHelper.addThread({
        id: fakeThreadId, title: 'New title', owner: registeredUserId,
      });
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${fakeThreadId}/comments/xxx/replies/xxx`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Komentar tidak ditemukan');
    });

    it('should response 404 when reply not found', async () => {
      // Arrange
      const fakeThreadId = 'thread-123';
      const fakeCommentId = 'comment-123';
      await ThreadsTableTestHelper.addThread({
        id: fakeThreadId, title: 'New title', owner: registeredUserId,
      });
      await CommentsTableTestHelper.addComment({
        id: fakeCommentId, threadId: fakeThreadId, content: 'New comment', owner: registeredUserId,
      });
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${fakeThreadId}/comments/${fakeCommentId}/replies/xxx`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('Balasan tidak ditemukan');
    });

    it('should response 401 when not the reply owner', async () => {
      // Arrange
      const fakeThreadId = 'thread-123';
      const fakeCommentId = 'comment-123';
      const fakeReplyId = 'reply-123';
      const fakeRepliedUserId = 'user-456';
      await UsersTableTestHelper.addUser({ id: fakeRepliedUserId, username: 'User giving a reply' });
      await ThreadsTableTestHelper.addThread({
        id: fakeThreadId, title: 'New title', owner: registeredUserId,
      });
      await CommentsTableTestHelper.addComment({
        id: fakeCommentId, threadId: fakeThreadId, content: 'New comment', owner: registeredUserId,
      });
      await RepliesTableTestHelper.addReply({
        id: fakeReplyId, threadId: fakeThreadId, commentId: fakeCommentId, content: 'New reply', owner: fakeRepliedUserId,
      });
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${fakeThreadId}/comments/${fakeCommentId}/replies/${fakeReplyId}`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.message).toEqual('Balasan hanya dapat dihapus oleh pemiliknya');
    });

    it('should response 200', async () => {
      // Arrange
      const fakeThreadId = 'thread-123';
      const fakeCommentId = 'comment-123';
      const fakeReplyId = 'reply-123';
      await ThreadsTableTestHelper.addThread({
        id: fakeThreadId, title: 'New title', owner: registeredUserId,
      });
      await CommentsTableTestHelper.addComment({
        id: fakeCommentId, threadId: fakeThreadId, content: 'New comment', owner: registeredUserId,
      });
      await RepliesTableTestHelper.addReply({
        id: fakeReplyId, threadId: fakeThreadId, commentId: fakeCommentId, content: 'New reply', owner: registeredUserId,
      });
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${fakeThreadId}/comments/${fakeCommentId}/replies/${fakeReplyId}`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });
  });
});
