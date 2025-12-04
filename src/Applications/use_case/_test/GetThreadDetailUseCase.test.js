const GetThreadDetailUseCase = require('../GetThreadDetailUseCase');

describe('GetThreadDetailUseCase', () => {
  it('should orchestrate getting thread detail correctly and map deleted comments', async () => {
    // Arrange
    const threadId = 'thread-123';

    const expectedThread = {
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: '2021-08-08T07:19:09.775Z',
      username: 'dicoding',
    };

    const commentList = [
      {
        id: 'comment-123',
        username: 'johndoe',
        date: '2021-08-08T07:22:33.555Z',
        content: 'sebuah comment',
        is_delete: false,
      },
      {
        id: 'comment-456',
        username: 'dicoding',
        date: '2021-08-08T07:26:21.338Z',
        content: 'komentar terhapus',
        is_delete: true,
      },
    ];

    const expectedResult = {
      ...expectedThread,
      comments: [
        {
          id: 'comment-123',
          username: 'johndoe',
          date: '2021-08-08T07:22:33.555Z',
          content: 'sebuah comment',
        },
        {
          id: 'comment-456',
          username: 'dicoding',
          date: '2021-08-08T07:26:21.338Z',
          content: '**komentar telah dihapus**',
        },
      ],
    };

    const mockThreadRepository = {};
    const mockCommentRepository = {};

    mockThreadRepository.getThreadById = jest.fn()
      .mockResolvedValue(expectedThread);

    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockResolvedValue(commentList);

    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const result = await getThreadDetailUseCase.execute(threadId);

    // Assert pastikan repo dipanggil dengan benar
    expect(mockThreadRepository.getThreadById)
      .toHaveBeenCalledWith(threadId);

    expect(mockCommentRepository.getCommentsByThreadId)
      .toHaveBeenCalledWith(threadId);

    // Assert hasil mapping sesuai
    expect(result).toStrictEqual(expectedResult);
  });

  it('should return thread detail with empty comments when no comments found', async () => {
    // Arrange
    const threadId = 'thread-123';

    const expectedThread = {
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: '2021-08-08T07:19:09.775Z',
      username: 'dicoding',
    };

    const mockThreadRepository = {};
    const mockCommentRepository = {};

    mockThreadRepository.getThreadById = jest.fn()
      .mockResolvedValue(expectedThread);

    mockCommentRepository.getCommentsByThreadId = jest.fn()
      .mockResolvedValue([]);

    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const result = await getThreadDetailUseCase.execute(threadId);

    // Assert
    expect(result).toStrictEqual({
      ...expectedThread,
      comments: [],
    });
  });
});
