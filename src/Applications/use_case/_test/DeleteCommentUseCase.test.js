const DeleteCommentUseCase = require('../DeleteCommentUseCase');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('DeleteCommentUseCase', () => {
  it('should orchestrate the delete comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      owner: 'dicoding',
    };

    const mockThreadRepository = {};
    const mockCommentRepository = {};

    // Mocking needed methods
    mockThreadRepository.verifyThreadExists = jest.fn()
      .mockResolvedValue();

    mockCommentRepository.verifyCommentOwner = jest.fn()
      .mockResolvedValue();

    mockCommentRepository.deleteComment = jest.fn()
      .mockResolvedValue();

    const deleteCommentUseCase = new DeleteCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    await deleteCommentUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyThreadExists)
      .toHaveBeenCalledWith('thread-123');

    expect(mockCommentRepository.verifyCommentOwner)
      .toHaveBeenCalledWith('comment-123', 'dicoding');

    expect(mockCommentRepository.deleteComment)
      .toHaveBeenCalledWith('comment-123');
  });

  it('should throw NotFoundError when thread does not exist', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-xxx',
      commentId: 'comment-123',
      owner: 'dicoding',
    };

    const mockThreadRepository = {};
    const mockCommentRepository = {};

    mockThreadRepository.verifyThreadExists = jest.fn()
      .mockRejectedValue(new NotFoundError('thread tidak ditemukan'));

    mockCommentRepository.verifyCommentOwner = jest.fn();

    const deleteCommentUseCase = new DeleteCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action & Assert
    await expect(deleteCommentUseCase.execute(useCasePayload))
      .rejects.toThrow(NotFoundError);

    // verifyCommentOwner & deleteComment should never be called
    expect(mockCommentRepository.verifyCommentOwner).not.toHaveBeenCalled();
  });

  it('should throw AuthorizationError when owner is not authorized', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      owner: 'user-999', // salah pemilik
    };

    const mockThreadRepository = {};
    const mockCommentRepository = {};

    mockThreadRepository.verifyThreadExists = jest.fn()
      .mockResolvedValue();

    mockCommentRepository.verifyCommentOwner = jest.fn()
      .mockRejectedValue(new AuthorizationError('anda tidak berhak'));

    mockCommentRepository.deleteComment = jest.fn();

    const deleteCommentUseCase = new DeleteCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action & Assert
    await expect(deleteCommentUseCase.execute(useCasePayload))
      .rejects.toThrow(AuthorizationError);

    expect(mockCommentRepository.deleteComment).not.toHaveBeenCalled();
  });
});
