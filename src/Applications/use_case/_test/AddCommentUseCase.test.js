const AddCommentUseCase = require('../AddCommentUseCase');
const NewComment = require('../../../Domains/comments/entities/NewComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');

describe('AddCommentUseCase', () => {
  it('should orchestrate the add comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      owner: 'dicoding',
      content: 'sebuah comment',
    };

    /** creating dependency of use case */
    const mockThreadRepository = {};
    const mockCommentRepository = {};

    mockThreadRepository.verifyThreadExists = jest.fn()
      .mockResolvedValue();

    mockCommentRepository.addComment = jest.fn()
      .mockResolvedValue(new AddedComment({
        id: 'comment-123',
        content: useCasePayload.content,
        owner: useCasePayload.owner,
      }));

    const addCommentUseCase = new AddCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const addedComment = await addCommentUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyThreadExists)
      .toBeCalledWith(useCasePayload.threadId);

    expect(mockCommentRepository.addComment)
      .toBeCalledWith(new NewComment({
        content: useCasePayload.content,
        owner: useCasePayload.owner,
        threadId: useCasePayload.threadId,
      }));

    expect(addedComment).toStrictEqual(new AddedComment({
      id: 'comment-123',
      content: useCasePayload.content,
      owner: useCasePayload.owner,
    }));
  });

  it('should throw error when thread does not exist', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-xxx',
      owner: 'dicoding',
      content: 'sebuah comment',
    };

    const mockThreadRepository = {};
    const mockCommentRepository = {};

    const notFoundError = new Error('THREAD.NOT_FOUND');

    mockThreadRepository.verifyThreadExists = jest.fn()
      .mockRejectedValue(notFoundError);

    mockCommentRepository.addComment = jest.fn();

    const addCommentUseCase = new AddCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action & Assert
    await expect(addCommentUseCase.execute(useCasePayload))
      .rejects.toThrowError(notFoundError);

    expect(mockThreadRepository.verifyThreadExists)
      .toBeCalledWith(useCasePayload.threadId);

    expect(mockCommentRepository.addComment).not.toBeCalled();
  });
});
