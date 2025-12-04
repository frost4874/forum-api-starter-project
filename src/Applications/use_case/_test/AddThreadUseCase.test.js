const AddThreadUseCase = require('../AddThreadUseCase');
const NewThread = require('../../../Domains/threads/entities/NewThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');

describe('AddThreadUseCase', () => {
  it('should orchestrate adding thread correctly', async () => {
    const useCasePayload = {
      title: 'sebuah title',
      body: 'sebuah body',
    };

    const owner = 'dicoding';

    const mockThreadRepository = {};
    mockThreadRepository.addThread = jest.fn()
      .mockResolvedValue(new AddedThread({
        id: 'thread-123',
        title: useCasePayload.title,
        owner,
      }));

    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    const addedThread = await addThreadUseCase.execute(useCasePayload, owner);

    expect(mockThreadRepository.addThread)
      .toHaveBeenCalledWith(new NewThread({
        title: useCasePayload.title,
        body: useCasePayload.body,
        owner,
      }));

    expect(addedThread).toStrictEqual(new AddedThread({
      id: 'thread-123',
      title: useCasePayload.title,
      owner,
    }));
  });

  it('should throw error if payload does not meet entity specification', async () => {
    // Arrange
    const badPayload = {
      title: 123,
      body: true,
    };

    const owner = 'dicoding';
    const mockThreadRepository = {};
    mockThreadRepository.addThread = jest.fn();

    const addThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    await expect(addThreadUseCase.execute(badPayload, owner))
      .rejects.toThrow();

    expect(mockThreadRepository.addThread).not.toHaveBeenCalled();
  });
});
