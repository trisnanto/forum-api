/* eslint-disable max-len */
const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads/{threadId}/comments/{commentId}/likes endpoint', () => {
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
    await CommentsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  describe('when PUT /threads/{threadId}/comments/{commentId}/likes', () => {
    it('should response 200 and persist like', async () => {
      // Arrange
      const fakeThreadId = 'thread-123';
      const fakeCommentId = 'comment-123';
      const server = await createServer(container);
      await ThreadsTableTestHelper.addThread({
        id: fakeThreadId, title: 'New title', owner: registeredUserId,
      });
      await CommentsTableTestHelper.addComment({
        id: fakeCommentId, threadId: fakeThreadId, content: 'New comment', owner: registeredUserId,
      });

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${fakeThreadId}/comments/${fakeCommentId}/likes`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const likeCount = await LikesTableTestHelper.countLikes(fakeCommentId);

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(likeCount).toEqual(1);
    });

    it('should response 404 when thread not found', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: '/threads/xxx/comments/xxx/likes',
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
      const server = await createServer(container);
      await ThreadsTableTestHelper.addThread({
        id: fakeThreadId, title: 'New title', owner: registeredUserId,
      });

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${fakeThreadId}/comments/xxx/likes`,
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
        method: 'PUT',
        url: '/threads/xxx/comments/xxx/likes',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });
  });
});
