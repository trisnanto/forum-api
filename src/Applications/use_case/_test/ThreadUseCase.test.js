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
      title: useCasePayload.title,
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
    /** creating fake credentialId */
    const fakeCredentialID = 'user-123';
    const useCasePayload = {
      title: 'A New Thread',
      body: "The new thread's body",
    };
    const expectedForumThread = new ForumThread({
      id: 'thread-123',
      title: useCasePayload.title,
      owner: fakeCredentialID,
    });

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedForumThread));
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
    expect(forumThread).toStrictEqual(expectedForumThread);
    expect(mockThreadRepository.verifyThreadId).toBeCalledWith('thread-123');
    expect(mockThreadRepository.getThreadById).toBeCalledWith('thread-123');
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith('thread-123');
    expect(mockReplyRepository.getRepliesByThreadId).toBeCalledWith('thread-123');
  });
});
