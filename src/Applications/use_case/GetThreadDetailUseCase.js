class GetThreadDetailUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(threadId) {
    // dapatkan data thread (+ username owner)
    const thread = await this._threadRepository.getThreadById(threadId);

    // dapatkan comment-comment pada thread tsb
    const comments = await this._commentRepository.getCommentsByThreadId(threadId);

    // mapping konten yang dihapus
    const mappedComments = comments.map((comment) => ({
      id: comment.id,
      username: comment.username,
      date: comment.date,
      content: comment.is_delete ? '**komentar telah dihapus**' : comment.content,
    }));

    return {
      ...thread,
      comments: mappedComments,
    };
  }
}

module.exports = GetThreadDetailUseCase;
