const ForumThread = require('../ForumThread');

describe('a ForumThread entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      title: 'New Title',
      owner: 'New owner',
    };

    // Action and Assert
    expect(() => new ForumThread(payload)).toThrowError('FORUM_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      title: 'dicoding',
      body: 123,
      owner: {},
    };

    // Action and Assert
    expect(() => new ForumThread(payload)).toThrowError('FORUM_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create forumThread object correctly', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
      title: 'New Title',
      body: 'New body',
      owner: 'New owner',
    };

    // Action
    const forumThread = new ForumThread(payload);

    // Assert
    expect(forumThread.id).toEqual(payload.id);
    expect(forumThread.title).toEqual(payload.title);
    expect(forumThread.owner).toEqual(payload.owner);
  });
});
