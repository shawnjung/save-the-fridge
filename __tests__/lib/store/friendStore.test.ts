// Must use var for jest.mock hoisting to access the variable
var mockSupabase: any;

jest.mock('@/lib/supabase', () => {
  const mockChain = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    ilike: jest.fn().mockReturnThis(),
    limit: jest.fn(),
  };

  mockSupabase = {
    auth: {
      getSession: jest.fn(),
    },
    from: jest.fn(() => ({
      ...mockChain,
      select: jest.fn().mockReturnValue(mockChain),
      insert: jest.fn().mockReturnValue(mockChain),
      update: jest.fn().mockReturnValue(mockChain),
    })),
  };
  return { supabase: mockSupabase };
});

import { useFriendStore, type Friendship, type SearchedUser } from '@/lib/store/friendStore';

const mockFriendship: Friendship = {
  id: 'friendship-1',
  requester_id: 'user-123',
  addressee_id: 'user-456',
  status: 'accepted',
  created_at: '2025-01-01T00:00:00Z',
  other_user: {
    id: 'user-456',
    username: 'alice',
    display_name: 'Alice',
    avatar_url: null,
  },
};

const mockPendingReceived: Friendship = {
  id: 'friendship-2',
  requester_id: 'user-789',
  addressee_id: 'user-123',
  status: 'pending',
  created_at: '2025-01-02T00:00:00Z',
  other_user: {
    id: 'user-789',
    username: 'bob',
    display_name: 'Bob',
    avatar_url: null,
  },
};

const mockPendingSent: Friendship = {
  id: 'friendship-3',
  requester_id: 'user-123',
  addressee_id: 'user-999',
  status: 'pending',
  created_at: '2025-01-03T00:00:00Z',
  other_user: {
    id: 'user-999',
    username: 'charlie',
    display_name: 'Charlie',
    avatar_url: null,
  },
};

describe('friendStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useFriendStore.setState({
      friends: [],
      pendingReceived: [],
      pendingSent: [],
      isLoading: false,
    });
  });

  describe('initial state', () => {
    it('should have empty friends array', () => {
      expect(useFriendStore.getState().friends).toEqual([]);
    });

    it('should have empty pendingReceived array', () => {
      expect(useFriendStore.getState().pendingReceived).toEqual([]);
    });

    it('should have empty pendingSent array', () => {
      expect(useFriendStore.getState().pendingSent).toEqual([]);
    });

    it('should not be loading', () => {
      expect(useFriendStore.getState().isLoading).toBe(false);
    });
  });

  describe('sendRequest', () => {
    it('should throw if not authenticated', async () => {
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: null },
      });

      await expect(
        useFriendStore.getState().sendRequest('user-456')
      ).rejects.toThrow('Not authenticated');
    });

    it('should insert friendship with pending status', async () => {
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: { user: { id: 'user-123' } } },
      });
      // The chain: from('friendships').insert({...}) returns { error: null }
      const insertMock = jest.fn().mockResolvedValueOnce({ error: null });
      mockSupabase.from.mockReturnValueOnce({ insert: insertMock });

      await useFriendStore.getState().sendRequest('user-456');

      expect(insertMock).toHaveBeenCalledWith({
        requester_id: 'user-123',
        addressee_id: 'user-456',
        status: 'pending',
      });
    });
  });

  describe('acceptRequest', () => {
    it('should update friendship status to accepted', async () => {
      const eqMock = jest.fn().mockResolvedValueOnce({ error: null });
      const updateMock = jest.fn().mockReturnValue({ eq: eqMock });
      mockSupabase.from.mockReturnValueOnce({ update: updateMock });

      await useFriendStore.getState().acceptRequest('friendship-2');

      expect(updateMock).toHaveBeenCalledWith({ status: 'accepted' });
    });
  });

  describe('blockUser', () => {
    it('should update friendship status to blocked', async () => {
      const eqMock = jest.fn().mockResolvedValueOnce({ error: null });
      const updateMock = jest.fn().mockReturnValue({ eq: eqMock });
      mockSupabase.from.mockReturnValueOnce({ update: updateMock });

      await useFriendStore.getState().blockUser('friendship-3');

      expect(updateMock).toHaveBeenCalledWith({ status: 'blocked' });
    });
  });

  describe('searchUsers', () => {
    it('should return empty array if not authenticated', async () => {
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: null },
      });

      const result = await useFriendStore.getState().searchUsers('test');
      expect(result).toEqual([]);
    });

    it('should search users by username with ilike', async () => {
      const mockUsers: SearchedUser[] = [
        { id: 'user-456', username: 'alice', display_name: 'Alice', avatar_url: null },
      ];
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: { user: { id: 'user-123' } } },
      });

      const limitMock = jest.fn().mockResolvedValueOnce({ data: mockUsers, error: null });
      const neqMock = jest.fn().mockReturnValue({ limit: limitMock });
      const ilikeMock = jest.fn().mockReturnValue({ neq: neqMock });
      const selectMock = jest.fn().mockReturnValue({ ilike: ilikeMock });
      mockSupabase.from.mockReturnValueOnce({ select: selectMock });

      const result = await useFriendStore.getState().searchUsers('ali');

      expect(result).toEqual(mockUsers);
      expect(ilikeMock).toHaveBeenCalledWith('username', '%ali%');
    });
  });
});
