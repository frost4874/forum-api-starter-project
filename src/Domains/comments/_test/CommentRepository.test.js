const CommentRepository = require('../CommentRepository');

describe('CommentRepository interface', () => {
  it('should throw error when invoke addComment function', async () => {
    // Arrange
    const commentRepository = new CommentRepository();

    // Action & Assert
    await expect(commentRepository.addComment({}))
      .rejects
      .toThrowError('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });

  it('should throw error when invoke deleteComment function', async () => {
    const commentRepository = new CommentRepository();

    await expect(commentRepository.deleteComment('comment-123'))
      .rejects
      .toThrowError('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });

  it('should throw error when invoke verifyCommentOwner function', async () => {
    const commentRepository = new CommentRepository();

    await expect(commentRepository.verifyCommentOwner('comment-123', 'user-123'))
      .rejects
      .toThrowError('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });

  it('should throw error when invoke getCommentsByThreadId function', async () => {
    const commentRepository = new CommentRepository();

    await expect(commentRepository.getCommentsByThreadId('thread-123'))
      .rejects
      .toThrowError('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});
