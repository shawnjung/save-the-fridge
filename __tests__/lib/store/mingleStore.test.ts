// Must use var for jest.mock hoisting to access the variable
var mockSupabase: any;

jest.mock('@/lib/supabase', () => {
  mockSupabase = {
    auth: {
      getSession: jest.fn(),
    },
    from: jest.fn(),
  };
  return { supabase: mockSupabase };
});

jest.mock('@/lib/anthropic', () => ({
  suggestRecipes: jest.fn().mockResolvedValue([
    {
      recipe_name: 'Test Recipe',
      description: 'A test recipe',
      ingredients_used: [],
      missing_ingredients: [],
      instructions: 'Cook it.',
      match_score: 90,
    },
  ]),
}));

import { useMingleStore, type MingleSession } from '@/lib/store/mingleStore';

const mockSession: MingleSession = {
  id: 'session-1',
  created_by: 'user-123',
  title: 'Friday Dinner',
  status: 'active',
  created_at: '2025-01-01T00:00:00Z',
  expires_at: '2025-01-02T00:00:00Z',
};

describe('mingleStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useMingleStore.setState({
      sessions: [],
      currentSession: null,
      participants: [],
      suggestions: [],
      isLoading: false,
    });
  });

  describe('initial state', () => {
    it('should have empty sessions array', () => {
      expect(useMingleStore.getState().sessions).toEqual([]);
    });

    it('should have null currentSession', () => {
      expect(useMingleStore.getState().currentSession).toBeNull();
    });

    it('should have empty participants array', () => {
      expect(useMingleStore.getState().participants).toEqual([]);
    });

    it('should have empty suggestions array', () => {
      expect(useMingleStore.getState().suggestions).toEqual([]);
    });

    it('should not be loading', () => {
      expect(useMingleStore.getState().isLoading).toBe(false);
    });
  });

  describe('fetchSessions', () => {
    it('should set isLoading during fetch', async () => {
      const orderMock = jest.fn().mockResolvedValueOnce({ data: [], error: null });
      const selectMock = jest.fn().mockReturnValue({ order: orderMock });
      mockSupabase.from.mockReturnValueOnce({ select: selectMock });

      const fetchPromise = useMingleStore.getState().fetchSessions();
      expect(useMingleStore.getState().isLoading).toBe(true);
      await fetchPromise;
      expect(useMingleStore.getState().isLoading).toBe(false);
    });

    it('should populate sessions from supabase', async () => {
      const orderMock = jest.fn().mockResolvedValueOnce({
        data: [mockSession],
        error: null,
      });
      const selectMock = jest.fn().mockReturnValue({ order: orderMock });
      mockSupabase.from.mockReturnValueOnce({ select: selectMock });

      await useMingleStore.getState().fetchSessions();

      expect(useMingleStore.getState().sessions).toHaveLength(1);
      expect(useMingleStore.getState().sessions[0].title).toBe('Friday Dinner');
    });

    it('should handle errors from supabase', async () => {
      const orderMock = jest.fn().mockResolvedValueOnce({
        data: null,
        error: new Error('Network error'),
      });
      const selectMock = jest.fn().mockReturnValue({ order: orderMock });
      mockSupabase.from.mockReturnValueOnce({ select: selectMock });

      await expect(useMingleStore.getState().fetchSessions()).rejects.toThrow('Network error');
    });
  });

  describe('createSession', () => {
    it('should throw if not authenticated', async () => {
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: null },
      });

      await expect(
        useMingleStore.getState().createSession('Test', ['user-456'])
      ).rejects.toThrow('Not authenticated');
    });

    it('should create session and add participants', async () => {
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: { user: { id: 'user-123' } } },
      });
      // Mock session insert chain: from().insert().select().single()
      const singleMock = jest.fn().mockResolvedValueOnce({
        data: mockSession,
        error: null,
      });
      const selectMock = jest.fn().mockReturnValue({ single: singleMock });
      const insertMock = jest.fn().mockReturnValue({ select: selectMock });
      mockSupabase.from.mockReturnValueOnce({ insert: insertMock });

      // Mock participant insert
      const participantInsertMock = jest.fn().mockResolvedValueOnce({ error: null });
      mockSupabase.from.mockReturnValueOnce({ insert: participantInsertMock });

      const sessionId = await useMingleStore
        .getState()
        .createSession('Friday Dinner', ['user-456']);

      expect(sessionId).toBe('session-1');
    });
  });

  describe('updateSessionStatus', () => {
    it('should update session status via supabase', async () => {
      // Mock update chain: from().update().eq()
      const eqMock = jest.fn().mockResolvedValueOnce({ error: null });
      const updateMock = jest.fn().mockReturnValue({ eq: eqMock });
      mockSupabase.from.mockReturnValueOnce({ update: updateMock });

      // Mock for fetchSessions called after
      const orderMock = jest.fn().mockResolvedValueOnce({ data: [], error: null });
      const selectMock = jest.fn().mockReturnValue({ order: orderMock });
      mockSupabase.from.mockReturnValueOnce({ select: selectMock });

      await useMingleStore.getState().updateSessionStatus('session-1', 'completed');

      expect(updateMock).toHaveBeenCalledWith({ status: 'completed' });
    });
  });
});
