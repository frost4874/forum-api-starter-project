const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');

const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');

const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const NewComment = require('../../../Domains/comments/entities/NewComment');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('CommentRepositoryPostgres', () => {
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment function', () => {
    it('should persist new comment and return AddedComment correctly', async () => {
      const owner = 'dicoding';
      const threadId = 'thread-123';

      await UsersTableTestHelper.addUser({ id: owner });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner });

      const newComment = new NewComment({
        content: 'sebuah komentar',
        owner,
        threadId,
      });

      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      const addedComment = await commentRepositoryPostgres.addComment(newComment);

      const comments = await CommentsTableTestHelper.findCommentById('comment-123');
      expect(comments).toHaveLength(1);
      expect(comments[0].content).toEqual('sebuah komentar');
      expect(comments[0].owner).toEqual(owner);
      expect(comments[0].thread_id).toEqual(threadId);
      expect(comments[0].is_delete).toBe(false);

      expect(addedComment).toStrictEqual(new AddedComment({
        id: 'comment-123',
        content: 'sebuah komentar',
        owner,
      }));
    });
  });

  describe('deleteComment function', () => {
    it('should set is_delete to true (soft delete)', async () => {
      const owner = 'dicoding';
      const threadId = 'thread-123';
      const commentId = 'comment-123';

      await UsersTableTestHelper.addUser({ id: owner });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner });
      await CommentsTableTestHelper.addComment({
        id: commentId,
        threadId,
        owner,
        content: 'komentar awal',
        is_delete: false,
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, () => 'xyz');

      await commentRepositoryPostgres.deleteComment(commentId);

      const comments = await CommentsTableTestHelper.findCommentById(commentId);
      expect(comments).toHaveLength(1);
      expect(comments[0].is_delete).toBe(true);
    });
  });

  describe('verifyCommentOwner function', () => {
    it('should throw NotFoundError when comment is not found', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, () => 'xyz');

      await expect(
        commentRepositoryPostgres.verifyCommentOwner('comment-xxx', 'dicoding'),
      ).rejects.toThrowError(NotFoundError);
    });

    it('should throw AuthorizationError when owner does not match', async () => {
      const owner = 'dicoding';
      const otherUser = 'user-456';
      const threadId = 'thread-123';
      const commentId = 'comment-123';

      await UsersTableTestHelper.addUser({ id: owner });
      await UsersTableTestHelper.addUser({ id: otherUser, username: 'other' });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner });
      await CommentsTableTestHelper.addComment({
        id: commentId,
        threadId,
        owner,
        content: 'komentar',
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, () => 'xyz');

      await expect(
        commentRepositoryPostgres.verifyCommentOwner(commentId, otherUser),
      ).rejects.toThrowError(AuthorizationError);
    });

    it('should not throw error when owner matches', async () => {
      const owner = 'dicoding';
      const threadId = 'thread-123';
      const commentId = 'comment-123';

      await UsersTableTestHelper.addUser({ id: owner });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner });
      await CommentsTableTestHelper.addComment({
        id: commentId,
        threadId,
        owner,
        content: 'komentar',
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, () => 'xyz');

      await expect(
        commentRepositoryPostgres.verifyCommentOwner(commentId, owner),
      ).resolves.not.toThrow();
    });
  });

  describe('getCommentsByThreadId function', () => {
    it('should return comments ordered by date asc, with username and flags', async () => {
      const userA = 'dicoding';
      const userB = 'user-456';
      const threadId = 'thread-123';

      await UsersTableTestHelper.addUser({ id: userA, username: 'dicoding' });
      await UsersTableTestHelper.addUser({ id: userB, username: 'johndoe' });
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userA });

      // dua komentar, yang kedua dihapus
      await CommentsTableTestHelper.addComment({
        id: 'comment-111',
        threadId,
        owner: userA,
        content: 'komentar pertama',
        date: '2021-08-08T07:20:09.000Z',
        isDelete: false,
      });

      await CommentsTableTestHelper.addComment({
        id: 'comment-222',
        threadId,
        owner: userB,
        content: 'komentar kedua',
        date: '2021-08-08T07:21:09.000Z',
        isDelete: true,
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, () => 'xyz');

      const comments = await commentRepositoryPostgres.getCommentsByThreadId(threadId);

      expect(comments).toHaveLength(2);
      expect(comments[0]).toMatchObject({
        id: 'comment-111',
        content: 'komentar pertama',
        username: 'dicoding',
        is_delete: false,
      });
      expect(comments[1]).toMatchObject({
        id: 'comment-222',
        content: 'komentar kedua',
        username: 'johndoe',
        is_delete: true,
      });

      // pastikan urutan berdasarkan date
      expect(new Date(comments[0].date).getTime())
        .toBeLessThanOrEqual(new Date(comments[1].date).getTime());
    });
  });
});
