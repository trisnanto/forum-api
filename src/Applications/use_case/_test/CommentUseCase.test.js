/* eslint-disable max-len */
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentUseCase = require('../CommentUseCase');

describe('AddCommentUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the add comment action correctly', async () => {
    // Arrange
    /** creating fake threadId */
    const fakeThreadId = 'thread-123';

    /** creating fake credentialId */
    const fakeCredentialId = 'user-123';

    const useCasePayload = {
      content: 'New comment',
    };
    const expectedAddedComment = {
      id: 'comment-123',
      thread_id: fakeThreadId,
      content: useCasePayload.content,
      owner: fakeCredentialId,
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.addComment = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedAddedComment));

    /** creating use case instance */
    const getCommentUseCase = new CommentUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action
    const addedComment = await getCommentUseCase.addComment(useCasePayload, fakeThreadId, fakeCredentialId);

    // Assert
    expect(addedComment).toStrictEqual(expectedAddedComment);
    expect(mockThreadRepository.addComment).toBeCalledWith(useCasePayload, fakeThreadId, fakeCredentialId);
  });
});

describe('DeleteCommentUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the delete comment action correctly', async () => {
    // Arrange
    const useCasePayload = 'comment-123';
    const credentialId = 'user-123';
    const expectedDeletedComment = {
      id: 'comment-123',
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.deleteCommentById = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedDeletedComment));

    /** creating use case instance */
    const commentUseCase = new CommentUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action
    const deletedComment = await commentUseCase.deleteCommentById(useCasePayload, credentialId);

    // Assert
    expect(deletedComment).toStrictEqual(expectedDeletedComment);
    expect(mockThreadRepository.deleteCommentById).toBeCalledWith(useCasePayload, credentialId);
  });
});

describe('GetCommentUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the get comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'New comment',
    };
    const expectedThreadComment = {
      content: useCasePayload.content,
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.getCommentById = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedThreadComment));

    /** creating use case instance */
    const commentUseCase = new CommentUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action
    const threadComment = await commentUseCase.getCommentById('comment-123');

    // Assert
    expect(threadComment).toStrictEqual(expectedThreadComment);
    expect(mockThreadRepository.getCommentById).toBeCalledWith('comment-123');
  });
});
