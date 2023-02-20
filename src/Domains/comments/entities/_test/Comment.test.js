const Comment = require('../Comment');

describe('Comment entities', () => {
  it('should throw error when payload did not contain needed property', async () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'New user',
      date: '2023-02-09T07:43:19.593Z',
      id_delete: false,
      like_count: '0',
    };

    // Action and Assert
    await expect(() => new Comment(payload, [])).toThrowError('COMMENT.NOT_CONTAIN_CONTENT');
  });

  it('should throw error when payload did not meet data type specification', async () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'New user',
      date: '2023-02-09T07:43:19.593Z',
      content: 12345,
      id_delete: false,
      like_count: '0',
    };

    // Action and Assert
    await expect(() => new Comment(payload, [])).toThrowError('COMMENT.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create Comment entities correctly', () => {
    // Arrange
    const payload1 = {
      id: 'comment-123',
      username: 'New user',
      date: '2023-02-09T07:43:19.593Z',
      content: 'New comment',
      id_delete: false,
      like_count: '0',
    };
    const payload2 = { ...payload1 };
    payload2.is_delete = true;

    // Action
    const newComment1 = new Comment(payload1, []);
    const newComment2 = new Comment(payload2, []);

    // Assert
    expect(newComment1).toBeInstanceOf(Comment);
    expect(newComment2).toBeInstanceOf(Comment);
    expect(newComment1.id).toEqual(payload1.id);
    expect(newComment1.username).toEqual(payload1.username);
    expect(newComment1.date).toEqual(payload1.date);
    expect(newComment1.content).toEqual(payload1.content);
    expect(newComment1.likeCount).toEqual(0);
    expect(newComment1.replies).toEqual([]);
    expect(newComment2.content).toEqual('**komentar telah dihapus**');
  });
});
