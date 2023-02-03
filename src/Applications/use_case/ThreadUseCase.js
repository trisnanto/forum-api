/* eslint-disable no-underscore-dangle */
const NewThread = require('../../Domains/threads/entities/NewThread');

class ThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async addThread(useCasePayload, credentialId) {
    const newThread = new NewThread(useCasePayload);
    return this._threadRepository.addThread(newThread, credentialId);
  }

  async getThreadById(threadId) {
    return this._threadRepository.getThreadById(threadId);
  }
}

module.exports = ThreadUseCase;
