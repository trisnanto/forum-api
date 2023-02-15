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
      owner: fakeCredentialID,
    });

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.addThread = jest.fn()
      .mockImplementation(() => Promise.resolve(new ForumThread({
        id: 'thread-123',
        title: 'A New Thread',
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
          likeCount: 0,
        },
        {
          id: 'comment-456',
          username: 'user-789',
          date: '2023-02-09T08:43:19.593Z',
          content: '**komentar telah dihapus**',
          replies: [
            {
              id: 'reply-456',
              content: '**balasan telah dihapus**',
              date: '2023-02-09T08:43:19.593Z',
              username: 'user-789',
            },
          ],
          likeCount: 0,
        },
      ],
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve('thread-123'));
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve({
        id: 'thread-123',
        title: 'A New Thread',
        body: "The new thread's body",
        date: '2023-02-09T07:43:19.593Z',
        username: 'New user 1',
      }));
    mockCommentRepository.getCommentsByThreadId = jest.fn(() => Promise.resolve([
      {
        id: 'comment-123',
        username: 'user-456',
        date: '2023-02-09T08:43:19.593Z',
        content: 'New comment',
        is_delete: false,
        like_count: '0',
      },
      {
        id: 'comment-456',
        username: 'user-789',
        date: '2023-02-09T08:43:19.593Z',
        content: '**komentar telah dihapus**',
        is_delete: true,
        like_count: '0',
      }]));
    mockReplyRepository.getRepliesByThreadId = jest.fn(() => Promise.resolve([
      {
        id: 'reply-123',
        comment_id: 'comment-123',
        content: 'New reply',
        date: '2023-02-09T08:43:19.593Z',
        username: 'user-789',
        is_delete: false,
      },
      {
        id: 'reply-456',
        comment_id: 'comment-456',
        content: '**balasan telah dihapus**',
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
    expect(forumThread).toEqual(expectedForumThread);
    expect(mockThreadRepository.verifyThreadId).toBeCalledWith('thread-123');
    expect(mockThreadRepository.getThreadById).toBeCalledWith('thread-123');
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith('thread-123');
    expect(mockReplyRepository.getRepliesByThreadId).toBeCalledWith('thread-123');
  });
});
