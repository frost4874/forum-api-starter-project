class DeleteCommentUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    const { threadId, commentId, owner } = useCasePayload;

    // cek thread ada
    await this._threadRepository.verifyThreadExists(threadId);

    // cek comment ada & milik owner
    await this._commentRepository.verifyCommentOwner(commentId, owner);

    // soft delete
    await this._commentRepository.deleteComment(commentId);
  }
}

module.exports = DeleteCommentUseCase;
