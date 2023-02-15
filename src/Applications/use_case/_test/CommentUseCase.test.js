/* eslint-disable no-underscore-dangle */
/* eslint-disable max-len */
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const CommentUseCase = require('../CommentUseCase');

/** creating dependency of use case */
const mockThreadRepository = new ThreadRepository();
const mockCommentRepository = new CommentRepository();

/** creating use case instance */
const commentUseCase = new CommentUseCase({
  threadRepository: mockThreadRepository, commentRepository: mockCommentRepository,
});

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
      content: useCasePayload.content,
      owner: fakeCredentialId,
    };

    /** mocking needed function */
    mockThreadRepository.verifyThreadId = jest.fn(() => Promise.resolve('thread-123'));
    mockCommentRepository.addComment = jest.fn(() => Promise.resolve({
      id: 'comment-123',
      content: 'New comment',
      owner: 'user-123',
    }));

    // Action
    const addedComment = await commentUseCase.addComment(useCasePayload, fakeThreadId, fakeCredentialId);

    // Assert
    expect(addedComment).toStrictEqual(expectedAddedComment);
    expect(mockThreadRepository.verifyThreadId).toBeCalledWith(fakeThreadId);
    expect(mockCommentRepository.addComment).toBeCalledWith(useCasePayload, fakeThreadId, fakeCredentialId);
  });
});

describe('DeleteCommentUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the delete comment action correctly', async () => {
    // Arrange
    const fakeThreadId = 'thread-123';
    const useCasePayload = 'comment-123';
    const credentialId = 'user-123';
    // const expectedDeletedComment = ('comment-123');

    /** mocking needed function */
    mockThreadRepository.verifyThreadId = jest.fn(() => Promise.resolve('thread-123'));
    mockCommentRepository.verifyCommentId = jest.fn(() => Promise.resolve('comment-123'));
    mockCommentRepository.verifyCommentOwnership = jest.fn(() => Promise.resolve('user-123'));
    mockCommentRepository.deleteCommentById = jest.fn(() => Promise.resolve());

    // Action
    await commentUseCase.deleteCommentById(useCasePayload, fakeThreadId, credentialId);

    // Assert
    // expect(deletedComment).toStrictEqual(expectedDeletedComment);
    expect(mockThreadRepository.verifyThreadId).toBeCalledWith(fakeThreadId);
    expect(mockCommentRepository.verifyCommentId).toBeCalledWith(useCasePayload);
    expect(mockCommentRepository.verifyCommentOwnership).toBeCalledWith(useCasePayload, credentialId);
    expect(mockCommentRepository.deleteCommentById).toBeCalledWith(useCasePayload);
  });
});

describe('_verifyPayload function', () => {
  it('should throw error when payload did not contain needed property', async () => {
    // Arrange
    const payload = {};

    // Action and Assert
    await expect(commentUseCase.addComment(payload, 'thread-123', 'user-123')).rejects.toThrowError('COMMENT_USE_CASE.NOT_CONTAIN_CONTENT');
  });

  it('should throw error when payload did not meet data type specification', async () => {
    // Arrange
    const payload = {
      content: 123,
    };

    // Action and Assert
    await expect(commentUseCase.addComment(payload, 'thread-123', 'user-123')).rejects.toThrowError('COMMENT_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });
});
