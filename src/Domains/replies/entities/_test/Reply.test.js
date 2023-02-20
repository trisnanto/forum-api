const Reply = require('../Reply');

describe('Reply entities', () => {
  it('should throw error when payload did not contain needed property', async () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      username: 'New user',
      date: '2023-02-09T07:43:19.593Z',
      is_delete: false,
    };

    // Action and Assert
    await expect(() => new Reply(payload, [])).toThrowError('REPLY.NOT_CONTAIN_CONTENT');
  });

  it('should throw error when payload did not meet data type specification', async () => {
    // Arrange
    const payload = {
      id: 'reply-123',
      username: 'New user',
      date: '2023-02-09T07:43:19.593Z',
      content: 12345,
      is_delete: false,
    };

    // Action and Assert
    await expect(() => new Reply(payload, [])).toThrowError('REPLY.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create Reply entities correctly', () => {
    // Arrange
    const payload1 = {
      id: 'reply-123',
      username: 'New user',
      date: '2023-02-09T07:43:19.593Z',
      content: 'New reply',
      is_delete: false,
    };

    const payload2 = { ...payload1 };
    payload2.is_delete = true;

    // Action
    const newReply1 = new Reply(payload1);
    const newReply2 = new Reply(payload2);

    // Assert
    expect(newReply1).toBeInstanceOf(Reply);
    expect(newReply2).toBeInstanceOf(Reply);
    expect(newReply1.id).toEqual(payload1.id);
    expect(newReply1.username).toEqual(payload1.username);
    expect(newReply1.date).toEqual(payload1.date);
    expect(newReply1.content).toEqual(payload1.content);
    expect(newReply2.content).toEqual('**balasan telah dihapus**');
  });
});
