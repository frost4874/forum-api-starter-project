const NewComment = require('../../Domains/comments/entities/NewComment');

class AddCommentUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    const { threadId, owner, content } = useCasePayload;

    // pastikan thread ada → kalau tidak, lempar NotFoundError
    await this._threadRepository.verifyThreadExists(threadId);

    const newComment = new NewComment({ content, owner, threadId });

    const addedComment = await this._commentRepository.addComment(newComment);
    return addedComment;
  }
}

module.exports = AddCommentUseCase;
