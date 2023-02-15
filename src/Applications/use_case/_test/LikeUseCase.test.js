/* eslint-disable no-underscore-dangle */
/* eslint-disable max-len */
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const LikeRepository = require('../../../Domains/likes/LikeRepository');
const LikeUseCase = require('../LikeUseCase');

describe('UpdateLikeUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */

  const fakeThreadId = 'thread-123';
  const fakeCommentId = 'comment-123';
  const fakeCredentialId = 'user-123';

  /** creating dependency of use case */
  const mockThreadRepository = new ThreadRepository();
  const mockCommentRepository = new CommentRepository();
  const mockLikeRepository = new LikeRepository();

  /** mocking needed function */
  mockThreadRepository.verifyThreadId = jest.fn(() => Promise.resolve('thread-123'));
  mockCommentRepository.verifyCommentId = jest.fn(() => Promise.resolve('comment-123'));

  it('should orchestrating the like action correctly', async () => {
    // Arrange
    const expectedResponse = undefined;

    /** mocking needed function */
    mockLikeRepository.isAlreadyLiked = jest.fn(() => Promise.resolve('like-123'));
    mockLikeRepository.deleteLikeById = jest.fn(() => Promise.resolve());

    /** creating use case instance */
    const likeUseCase = new LikeUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    const response = await likeUseCase.updateLike(fakeThreadId, fakeCommentId, fakeCredentialId);

    // Assert
    expect(response).toEqual(expectedResponse);
    expect(mockThreadRepository.verifyThreadId).toBeCalledWith(fakeThreadId);
    expect(mockCommentRepository.verifyCommentId).toBeCalledWith(fakeCommentId);
    expect(mockLikeRepository.isAlreadyLiked).toBeCalledWith(fakeCommentId, fakeCredentialId);
    expect(mockLikeRepository.deleteLikeById).toBeCalledWith('like-123');
  });

  it('should orchestrating the unlike action correctly', async () => {
    // Arrange
    const expectedResponse = 'like-123';

    /** mocking needed function */
    mockLikeRepository.isAlreadyLiked = jest.fn(() => Promise.resolve());
    mockLikeRepository.addLike = jest.fn(() => Promise.resolve('like-123'));

    /** creating use case instance */
    const likeUseCase = new LikeUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    const response = await likeUseCase.updateLike(fakeThreadId, fakeCommentId, fakeCredentialId);

    // Assert
    expect(response).toEqual(expectedResponse);
    expect(mockThreadRepository.verifyThreadId).toBeCalledWith(fakeThreadId);
    expect(mockCommentRepository.verifyCommentId).toBeCalledWith(fakeCommentId);
    expect(mockLikeRepository.isAlreadyLiked).toBeCalledWith(fakeCommentId, fakeCredentialId);
    expect(mockLikeRepository.addLike).toBeCalledWith(fakeCommentId, fakeCredentialId);
  });
});
