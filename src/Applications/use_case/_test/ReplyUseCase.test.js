/* eslint-disable no-underscore-dangle */
/* eslint-disable max-len */
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
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
      content: useCasePayload.content,
      owner: fakeCredentialId,
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentId = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.addReply = jest.fn()
      .mockImplementation(() => Promise.resolve({
        id: 'reply-123',
        content: 'New reply',
        owner: 'user-123',
      }));

    /** creating use case instance */
    const getReplyUseCase = new ReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const addedReply = await getReplyUseCase.addReply(useCasePayload, fakeThreadId, fakeCommentId, fakeCredentialId);

    // Assert
    expect(addedReply).toStrictEqual(expectedAddedReply);
    expect(mockThreadRepository.verifyThreadId).toBeCalledWith(fakeThreadId);
    expect(mockCommentRepository.verifyCommentId).toBeCalledWith(fakeCommentId);
    expect(mockReplyRepository.addReply).toBeCalledWith(useCasePayload, fakeThreadId, fakeCommentId, fakeCredentialId);
  });
});

describe('DeleteReplyUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the delete reply action correctly', async () => {
    // Arrange
    const fakeThreadId = 'thread-123';
    const fakeCommentId = 'comment-123';
    const useCasePayload = 'reply-123';
    const credentialId = 'user-123';
    const expectedDeletedReply = {
      id: 'reply-123',
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentId = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.verifyReplyId = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.verifyReplyOwnership = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.deleteReplyById = jest.fn()
      .mockImplementation(() => Promise.resolve({
        id: 'reply-123',
      }));

    /** creating use case instance */
    const replyUseCase = new ReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const deletedReply = await replyUseCase.deleteReplyById(useCasePayload, fakeThreadId, fakeCommentId, credentialId);

    // Assert
    expect(deletedReply).toStrictEqual(expectedDeletedReply);
    expect(mockThreadRepository.verifyThreadId).toBeCalledWith(fakeThreadId);
    expect(mockCommentRepository.verifyCommentId).toBeCalledWith(fakeCommentId);
    expect(mockReplyRepository.verifyReplyId).toBeCalledWith(useCasePayload);
    expect(mockReplyRepository.verifyReplyOwnership).toBeCalledWith(useCasePayload, credentialId);
    expect(mockReplyRepository.deleteReplyById).toBeCalledWith(useCasePayload);
  });
});

describe('_verifyPayload function', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {};
    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();
    /** creating use case instance */
    const replyUseCase = new ReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action and Assert
    expect(() => replyUseCase._verifyPayload(payload)).toThrowError('REPLY_USE_CASE.NOT_CONTAIN_CONTENT');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      content: 123,
    };
    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();
    /** creating use case instance */
    const replyUseCase = new ReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action and Assert
    expect(() => replyUseCase._verifyPayload(payload)).toThrowError('REPLY_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });
});
