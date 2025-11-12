import { USER_QUERIES, USER_MUTATIONS } from '@/src/server/db/queries/user.query';
import { db } from '@/src/server/db/index';
import { User } from '@/src/server/db/schema/schema';
import { eq } from 'drizzle-orm';

// Mock Drizzle ORM and schema
jest.mock('@/src/server/db/index', () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    then: jest.fn(),
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    returning: jest.fn(),
  },
}));

jest.mock('drizzle-orm', () => ({
  eq: jest.fn(),
}));

jest.mock('@/src/server/db/schema/schema', () => ({
  User: {
    id: 'mockUserId',
    clerkId: 'mockUserClerkId',
    firstName: 'mockUserFirstName',
    lastName: 'mockUserLastName',
  },
}));

describe('USER_QUERIES', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('mapClerkIdtoLocalId', () => {
    it('should return the local ID if a user is found', async () => {
      (db.select as jest.Mock).mockReturnThis();
      (db.from as jest.Mock).mockReturnThis();
      (db.where as jest.Mock).mockReturnThis();
      (db.limit as jest.Mock).mockReturnThis();
      (db.then as jest.Mock).mockImplementation((callback) => callback([{ id: 'local_user_id_123' }]));
      (eq as jest.Mock).mockReturnValue('eq_condition');

      const result = await USER_QUERIES.mapClerkIdtoLocalId('clerk_user_id_123');

      expect(db.select).toHaveBeenCalledWith({ id: User.id });
      expect(db.from).toHaveBeenCalledWith(User);
      expect(eq).toHaveBeenCalledWith(User.clerkId, 'clerk_user_id_123');
      expect(db.where).toHaveBeenCalledWith('eq_condition');
      expect(db.limit).toHaveBeenCalledWith(1);
      expect(result).toBe('local_user_id_123');
    });

    it('should throw an error if no user is found', async () => {
      (db.select as jest.Mock).mockReturnThis();
      (db.from as jest.Mock).mockReturnThis();
      (db.where as jest.Mock).mockReturnThis();
      (db.limit as jest.Mock).mockReturnThis();
      (db.then as jest.Mock).mockImplementation((callback) => callback([]));
      (eq as jest.Mock).mockReturnValue('eq_condition');

      await expect(USER_QUERIES.mapClerkIdtoLocalId('non_existent_clerk_id')).rejects.toThrow(
        'no user found for clerkId:[object Object]',
      );
    });
  });
});

describe('USER_MUTATIONS', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      (db.insert as jest.Mock).mockReturnThis();
      (db.values as jest.Mock).mockReturnThis();
      (db.then as jest.Mock).mockImplementation((callback) => callback([{ id: 'new_user_id' }]));

      await USER_MUTATIONS.createUser('clerk_id_abc', 'John', 'Doe');

      expect(db.insert).toHaveBeenCalledWith(User);
      expect(db.values).toHaveBeenCalledWith({
        clerkId: 'clerk_id_abc',
        firstName: 'John',
        lastName: 'Doe',
      });
    });
  });

  describe('deleteUser', () => {
    it('should mark a user as deleted', async () => {
      (db.update as jest.Mock).mockReturnThis();
      (db.set as jest.Mock).mockReturnThis();
      (db.where as jest.Mock).mockReturnThis();
      (db.then as jest.Mock).mockImplementation((callback) => callback([]));
      (eq as jest.Mock).mockReturnValue('eq_condition');

      const mockDate = new Date();
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

      await USER_MUTATIONS.deleteUser('local_user_id_123');

      expect(db.update).toHaveBeenCalledWith(User);
      expect(db.set).toHaveBeenCalledWith({ deletedAt: mockDate });
      expect(eq).toHaveBeenCalledWith(User.id, 'local_user_id_123');
      expect(db.where).toHaveBeenCalledWith('eq_condition');
    });
  });

  describe('deleteByClerkId', () => {
    it('should delete a user by clerk ID', async () => {
      const mapClerkIdtoLocalIdSpy = jest.spyOn(USER_QUERIES, 'mapClerkIdtoLocalId');
      mapClerkIdtoLocalIdSpy.mockResolvedValue('local_user_id_123' as any);
      const deleteUserSpy = jest.spyOn(USER_MUTATIONS, 'deleteUser');
      deleteUserSpy.mockResolvedValue(undefined);

      await USER_MUTATIONS.deleteByClerkId('clerk_user_id_123');

      expect(mapClerkIdtoLocalIdSpy).toHaveBeenCalledWith('clerk_user_id_123');
      expect(deleteUserSpy).toHaveBeenCalledWith('local_user_id_123');
    });
  });

  describe('updateUser', () => {
    it('should update a user', async () => {
      (db.update as jest.Mock).mockReturnThis();
      (db.set as jest.Mock).mockReturnThis();
      (db.where as jest.Mock).mockReturnThis();
      (db.returning as jest.Mock).mockResolvedValue([{ id: 'local_user_id_123', firstName: 'Jane' }]);
      (eq as jest.Mock).mockReturnValue('eq_condition');

      await USER_MUTATIONS.updateUser('local_user_id_123', { firstName: 'Jane' });

      expect(db.update).toHaveBeenCalledWith(User);
      expect(db.set).toHaveBeenCalledWith({ firstName: 'Jane' });
      expect(eq).toHaveBeenCalledWith(User.id, 'local_user_id_123');
      expect(db.where).toHaveBeenCalledWith('eq_condition');
      expect(db.returning).toHaveBeenCalled();
    });
  });

  describe('updateByClerkId', () => {
    it('should update a user by clerk ID', async () => {
      const mapClerkIdtoLocalIdSpy = jest.spyOn(USER_QUERIES, 'mapClerkIdtoLocalId');
      mapClerkIdtoLocalIdSpy.mockResolvedValue('local_user_id_123' as any);
      const updateUserSpy = jest.spyOn(USER_MUTATIONS, 'updateUser');
      updateUserSpy.mockResolvedValue(undefined);

      await USER_MUTATIONS.updateByClerkId('clerk_user_id_123', { lastName: 'Smith' });

      expect(mapClerkIdtoLocalIdSpy).toHaveBeenCalledWith('clerk_user_id_123');
      expect(updateUserSpy).toHaveBeenCalledWith('local_user_id_123', { lastName: 'Smith' });
    });
  });
});