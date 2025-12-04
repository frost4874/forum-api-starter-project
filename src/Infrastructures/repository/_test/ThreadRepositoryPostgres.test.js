const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');

const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');

const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const NewThread = require('../../../Domains/threads/entities/NewThread');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread function', () => {
    it('should persist new thread and return AddedThread correctly', async () => {
      // Arrange
      const owner = 'dicoding';
      await UsersTableTestHelper.addUser({ id: owner });

      const newThread = new NewThread({
        title: 'sebuah thread',
        body: 'sebuah body thread',
        owner,
      });

      // fake id generator
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedThread = await threadRepositoryPostgres.addThread(newThread);

      // Assert data tersimpan di DB
      const threads = await ThreadsTableTestHelper.findThreadById('thread-123');
      expect(threads).toHaveLength(1);
      expect(threads[0].title).toEqual('sebuah thread');
      expect(threads[0].body).toEqual('sebuah body thread');
      expect(threads[0].owner).toEqual(owner);

      // Assert return entity sesuai
      expect(addedThread).toStrictEqual(new AddedThread({
        id: 'thread-123',
        title: 'sebuah thread',
        owner,
      }));
    });
  });

  describe('verifyThreadExists function', () => {
    it('should throw NotFoundError when thread not found', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, () => '123');

      // Action & Assert
      await expect(
        threadRepositoryPostgres.verifyThreadExists('thread-xxx'),
      ).rejects.toThrowError(NotFoundError);
    });

    it('should not throw error when thread exists', async () => {
      // Arrange
      const owner = 'dicoding';
      await UsersTableTestHelper.addUser({ id: owner });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner,
        title: 'judul',
        body: 'isi',
      });

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, () => '123');

      // Action & Assert
      await expect(
        threadRepositoryPostgres.verifyThreadExists('thread-123'),
      ).resolves.not.toThrow();
    });
  });

  describe('getThreadById function', () => {
    it('should throw NotFoundError when thread not found', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, () => '123');

      await expect(
        threadRepositoryPostgres.getThreadById('thread-xxx'),
      ).rejects.toThrowError(NotFoundError);
    });

    it('should return thread detail correctly when thread exists', async () => {
      // Arrange
      const owner = 'dicoding';
      await UsersTableTestHelper.addUser({ id: owner, username: 'dicoding' });

      const fixedDate = '2021-08-08T07:19:09.775Z';

      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner,
        title: 'sebuah thread',
        body: 'sebuah body thread',
        date: fixedDate,
      });

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, () => '123');

      // Action
      const thread = await threadRepositoryPostgres.getThreadById('thread-123');

      // Assert
      expect(thread.id).toEqual('thread-123');
      expect(thread.title).toEqual('sebuah thread');
      expect(thread.body).toEqual('sebuah body thread');
      expect(thread.username).toEqual('dicoding');
      expect(thread.date).toBeDefined();
    });
  });
});
