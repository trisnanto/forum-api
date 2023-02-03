/* eslint-disable max-len */
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const ReplyUseCase = require('../ReplyUseCase');

describe('AddReplyUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the add reply action correctly', async () => {
    // Arrange
    const fakeThreadId = 'thread-123';
    const fakeCommentId = 'comment-123';
    const fakeCredentialId = 'user-123';

    const useCasePayload = {
      content: 'New reply',
    };
    const expectedAddedReply = {
      id: 'reply-123',
      thread_id: fakeThreadId,
      comment_id: fakeCommentId,
      content: useCasePayload.content,
      owner: fakeCredentialId,
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.addReply = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedAddedReply));

    /** creating use case instance */
    const getReplyUseCase = new ReplyUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action
    const addedReply = await getReplyUseCase.addReply(useCasePayload, fakeThreadId, fakeCommentId, fakeCredentialId);

    // Assert
    expect(addedReply).toStrictEqual(expectedAddedReply);
    expect(mockThreadRepository.addReply).toBeCalledWith(useCasePayload, fakeThreadId, fakeCommentId, fakeCredentialId);
  });
});

describe('DeleteReplyUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the delete reply action correctly', async () => {
    // Arrange
    const useCasePayload = 'reply-123';
    const credentialId = 'user-123';
    const expectedDeletedReply = {
      id: 'reply-123',
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.deleteReplyById = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedDeletedReply));

    /** creating use case instance */
    const replyUseCase = new ReplyUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action
    const deletedReply = await replyUseCase.deleteReplyById(useCasePayload, credentialId);

    // Assert
    expect(deletedReply).toStrictEqual(expectedDeletedReply);
    expect(mockThreadRepository.deleteReplyById).toBeCalledWith(useCasePayload, credentialId);
  });
});
