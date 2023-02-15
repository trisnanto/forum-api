const Comment = require('../Comment');

describe('Comment entities', () => {
  it('should create Comment entities correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      username: 'New user',
      date: '2023-02-09T07:43:19.593Z',
      content: 'New comment',
    };

    // Action
    const newComment = new Comment(payload, []);

    // Assert
    expect(newComment).toBeInstanceOf(Comment);
    expect(newComment.id).toEqual(payload.id);
    expect(newComment.username).toEqual(payload.username);
    expect(newComment.date).toEqual(payload.date);
    expect(newComment.replies).toEqual([]);
    expect(newComment.content).toEqual(payload.content);
  });
});
