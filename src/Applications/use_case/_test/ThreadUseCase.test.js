const NewThread = require('../../../Domains/threads/entities/NewThread');
const ForumThread = require('../../../Domains/threads/entities/ForumThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const ThreadUseCase = require('../ThreadUseCase');

describe('AddThreadUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the add thread action correctly', async () => {
    // Arrange
    /** creating fake credentialId */
    const fakeCredentialID = 'user-123';
    const useCasePayload = {
      title: 'A New Thread',
      body: "The new thread's body",
    };
    const expectedForumThread = new ForumThread({
      id: 'thread-123',
      title: 'A New Thread',
      body: "The new thread's body",
      owner: fakeCredentialID,
    });

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.addThread = jest.fn()
      .mockImplementation(() => Promise.resolve(new ForumThread({
        id: 'thread-123',
        title: 'A New Thread',
        body: "The new thread's body",
        owner: 'user-123',
      })));

    /** creating use case instance */
    const getThreadUseCase = new ThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action
    const forumThread = await getThreadUseCase.addThread(useCasePayload, fakeCredentialID);

    // Assert
    expect(forumThread).toStrictEqual(expectedForumThread);
    expect(mockThreadRepository.addThread).toBeCalledWith(new NewThread({
      title: useCasePayload.title,
      body: useCasePayload.body,
    }), fakeCredentialID);
  });
});

describe('GetThreadUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the get thread action correctly', async () => {
    // Arrange
    const expectedForumThread = {
      id: 'thread-123',
      title: 'A New Thread',
      body: "The new thread's body",
      date: '2023-02-09T07:43:19.593Z',
      username: 'New user 1',
      comments: [],
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve({
        id: 'thread-123',
        title: 'A New Thread',
        body: "The new thread's body",
        date: '2023-02-09T07:43:19.593Z',
        username: 'New user 1',
      }));
    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve([]));
    mockReplyRepository.getRepliesByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve([]));

    /** creating use case instance */
    const threadUseCase = new ThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const forumThread = await threadUseCase.getThreadById('thread-123');

    // Assert
    expect(mockThreadRepository.verifyThreadId).toBeCalledWith('thread-123');
    expect(mockThreadRepository.getThreadById).toBeCalledWith('thread-123');
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith('thread-123');
    expect(mockReplyRepository.getRepliesByThreadId).toBeCalledWith('thread-123');
    expect(forumThread.id).toEqual(expectedForumThread.id);
    expect(forumThread.title).toEqual(expectedForumThread.title);
    expect(forumThread.body).toEqual(expectedForumThread.body);
    expect(forumThread.date).toEqual(expectedForumThread.date);
    expect(forumThread.username).toEqual(expectedForumThread.username);
    expect(forumThread.comments).toEqual(expectedForumThread.comments);
  });

  it('should return thread with comment correctly', async () => {
    // Arrange
    const expectedForumThread = {
      id: 'thread-123',
      title: 'A New Thread',
      body: "The new thread's body",
      date: '2023-02-09T07:43:19.593Z',
      username: 'New user 1',
      comments: [
        {
          id: 'comment-123',
          username: 'user-456',
          date: '2023-02-09T08:43:19.593Z',
          content: 'New comment',
          replies: [],
        },
      ],
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve({
        id: 'thread-123',
        title: 'A New Thread',
        body: "The new thread's body",
        date: '2023-02-09T07:43:19.593Z',
        username: 'New user 1',
      }));
    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve([
        {
          id: 'comment-123',
          username: 'user-456',
          date: '2023-02-09T08:43:19.593Z',
          content: 'New comment',
          is_delete: false,
        },
      ]));
    mockReplyRepository.getRepliesByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve([]));

    /** creating use case instance */
    const threadUseCase = new ThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const forumThread = await threadUseCase.getThreadById('thread-123');

    // Assert
    expect(forumThread.comments[0].id).toEqual(expectedForumThread.comments[0].id);
    expect(forumThread.comments[0].username).toEqual(expectedForumThread.comments[0].username);
    expect(forumThread.comments[0].date).toEqual(expectedForumThread.comments[0].date);
    expect(forumThread.comments[0].content).toEqual(expectedForumThread.comments[0].content);
    expect(forumThread.comments[0].replies).toEqual(expectedForumThread.comments[0].replies);
  });

  it('should return thread with comment and reply correctly', async () => {
    // Arrange
    const expectedForumThread = {
      id: 'thread-123',
      title: 'A New Thread',
      body: "The new thread's body",
      date: '2023-02-09T07:43:19.593Z',
      username: 'New user 1',
      comments: [
        {
          id: 'comment-123',
          username: 'user-456',
          date: '2023-02-09T08:43:19.593Z',
          content: 'New comment',
          replies: [
            {
              id: 'reply-123',
              content: 'New reply',
              date: '2023-02-09T08:43:19.593Z',
              username: 'user-789',
            },
          ],
        },
      ],
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve({
        id: 'thread-123',
        title: 'A New Thread',
        body: "The new thread's body",
        date: '2023-02-09T07:43:19.593Z',
        username: 'New user 1',
      }));
    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve([
        {
          id: 'comment-123',
          username: 'user-456',
          date: '2023-02-09T08:43:19.593Z',
          content: 'New comment',
          is_delete: false,
        },
      ]));
    mockReplyRepository.getRepliesByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve([
        {
          id: 'reply-123',
          comment_id: 'comment-123',
          content: 'New reply',
          date: '2023-02-09T08:43:19.593Z',
          username: 'user-789',
          is_delete: false,
        },
      ]));

    /** creating use case instance */
    const threadUseCase = new ThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const forumThread = await threadUseCase.getThreadById('thread-123');

    // Assert
    expect(forumThread.comments[0].replies[0].id)
      .toEqual(expectedForumThread.comments[0].replies[0].id);
    expect(forumThread.comments[0].replies[0].content)
      .toEqual(expectedForumThread.comments[0].replies[0].content);
    expect(forumThread.comments[0].replies[0].date)
      .toEqual(expectedForumThread.comments[0].replies[0].date);
    expect(forumThread.comments[0].replies[0].username)
      .toEqual(expectedForumThread.comments[0].replies[0].username);
  });

  it('should return correct comment content if the comment has been deleted', async () => {
    // Arrange
    const expectedForumThread = {
      id: 'thread-123',
      title: 'A New Thread',
      body: "The new thread's body",
      date: '2023-02-09T07:43:19.593Z',
      username: 'New user 1',
      comments: [
        {
          id: 'comment-123',
          username: 'user-456',
          date: '2023-02-09T08:43:19.593Z',
          content: '**komentar telah dihapus**',
        },
      ],
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve({
        id: 'thread-123',
        title: 'A New Thread',
        body: "The new thread's body",
        date: '2023-02-09T07:43:19.593Z',
        username: 'New user 1',
      }));
    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve([{
        id: 'comment-123',
        username: 'user-456',
        date: '2023-02-09T08:43:19.593Z',
        content: 'New comment',
        is_delete: true,
      }]));
    mockReplyRepository.getRepliesByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve([]));

    /** creating use case instance */
    const threadUseCase = new ThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const forumThread = await threadUseCase.getThreadById('thread-123');

    // Assert
    expect(forumThread.comments[0].content).toEqual(expectedForumThread.comments[0].content);
  });

  it('should return correct reply content if the comment has been deleted', async () => {
    // Arrange
    const expectedForumThread = {
      id: 'thread-123',
      title: 'A New Thread',
      body: "The new thread's body",
      date: '2023-02-09T07:43:19.593Z',
      username: 'New user 1',
      comments: [
        {
          id: 'comment-123',
          username: 'user-456',
          date: '2023-02-09T08:43:19.593Z',
          content: 'New comment',
          replies: [
            {
              id: 'reply-123',
              content: '**balasan telah dihapus**',
              date: '2023-02-09T08:43:19.593Z',
              username: 'user-789',
            },
          ],
        },
      ],
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve({
        id: 'thread-123',
        title: 'A New Thread',
        body: "The new thread's body",
        date: '2023-02-09T07:43:19.593Z',
        username: 'New user 1',
      }));
    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve([{
        id: 'comment-123',
        username: 'user-456',
        date: '2023-02-09T08:43:19.593Z',
        content: 'New comment',
        is_delete: true,
      }]));
    mockReplyRepository.getRepliesByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve([
        {
          id: 'reply-123',
          comment_id: 'comment-123',
          content: 'New reply',
          date: '2023-02-09T08:43:19.593Z',
          username: 'user-789',
          is_delete: true,
        },
      ]));

    /** creating use case instance */
    const threadUseCase = new ThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const forumThread = await threadUseCase.getThreadById('thread-123');

    // Assert
    expect(forumThread.comments[0].replies[0].content)
      .toEqual(expectedForumThread.comments[0].replies[0].content);
  });
});
