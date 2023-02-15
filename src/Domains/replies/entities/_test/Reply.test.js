const Reply = require('../Reply');

describe('Reply entities', () => {
  it('should create Reply entities correctly', () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      username: 'New user',
      date: '2023-02-09T07:43:19.593Z',
      content: 'New reply',
    };

    // Action
    const newReply = new Reply(payload);

    // Assert
    expect(newReply).toBeInstanceOf(Reply);
    expect(newReply.id).toEqual(payload.id);
    expect(newReply.username).toEqual(payload.username);
    expect(newReply.date).toEqual(payload.date);
    expect(newReply.content).toEqual(payload.content);
  });
});
