// Must use var for jest.mock hoisting to access the variable
var mockSupabase: any;

jest.mock('@/lib/supabase', () => {
  mockSupabase = {
    auth: {
      getSession: jest.fn(),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn().mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } },
      }),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    })),
  };
  return { supabase: mockSupabase };
});

import { useAuthStore, type Profile } from '@/lib/store/authStore';

const mockProfile: Profile = {
  id: 'user-123',
  username: 'testuser',
  display_name: 'Test User',
  avatar_url: null,
  expo_push_token: null,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: null,
};

describe('authStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the store to initial state
    useAuthStore.setState({
      session: null,
      profile: null,
      isLoading: true,
    });
  });

  describe('initial state', () => {
    it('should have null session initially', () => {
      expect(useAuthStore.getState().session).toBeNull();
    });

    it('should have null profile initially', () => {
      expect(useAuthStore.getState().profile).toBeNull();
    });

    it('should be loading initially', () => {
      expect(useAuthStore.getState().isLoading).toBe(true);
    });
  });

  describe('signIn', () => {
    it('should call supabase signInWithPassword', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValueOnce({ error: null });
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: { user: { id: 'user-123' } } },
      });
      const mockFrom = mockSupabase.from();
      mockSupabase.from.mockReturnValueOnce(mockFrom);
      mockFrom.single.mockResolvedValueOnce({ data: mockProfile, error: null });

      await useAuthStore.getState().signIn('test@example.com', 'password123');

      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should throw error when signIn fails', async () => {
      const error = new Error('Invalid credentials');
      mockSupabase.auth.signInWithPassword.mockResolvedValueOnce({ error });

      await expect(
        useAuthStore.getState().signIn('test@example.com', 'wrong')
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('signUp', () => {
    it('should call supabase signUp with username in options', async () => {
      mockSupabase.auth.signUp.mockResolvedValueOnce({ error: null });
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: { user: { id: 'user-123' } } },
      });
      const mockFrom = mockSupabase.from();
      mockSupabase.from.mockReturnValueOnce(mockFrom);
      mockFrom.single.mockResolvedValueOnce({ data: mockProfile, error: null });

      await useAuthStore.getState().signUp('test@example.com', 'password123', 'testuser');

      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: { data: { username: 'testuser' } },
      });
    });

    it('should throw error when signUp fails', async () => {
      const error = new Error('Email already exists');
      mockSupabase.auth.signUp.mockResolvedValueOnce({ error });

      await expect(
        useAuthStore.getState().signUp('test@example.com', 'pass', 'user')
      ).rejects.toThrow('Email already exists');
    });
  });

  describe('signOut', () => {
    it('should call supabase signOut and clear state', async () => {
      mockSupabase.auth.signOut.mockResolvedValueOnce({ error: null });

      // Set some state first
      useAuthStore.setState({ session: {} as any, profile: mockProfile });

      await useAuthStore.getState().signOut();

      expect(mockSupabase.auth.signOut).toHaveBeenCalled();
      expect(useAuthStore.getState().session).toBeNull();
      expect(useAuthStore.getState().profile).toBeNull();
    });

    it('should throw error when signOut fails', async () => {
      const error = new Error('Network error');
      mockSupabase.auth.signOut.mockResolvedValueOnce({ error });

      await expect(useAuthStore.getState().signOut()).rejects.toThrow('Network error');
    });
  });

  describe('initialize', () => {
    it('should set isLoading to false after initialization', async () => {
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: null },
      });

      await useAuthStore.getState().initialize();

      expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it('should set session when one exists', async () => {
      const mockSession = { user: { id: 'user-123' } };
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: mockSession },
      });
      const mockFrom = mockSupabase.from();
      mockSupabase.from.mockReturnValueOnce(mockFrom);
      mockFrom.single.mockResolvedValueOnce({ data: mockProfile, error: null });

      await useAuthStore.getState().initialize();

      expect(useAuthStore.getState().session).toEqual(mockSession);
      expect(useAuthStore.getState().profile).toEqual(mockProfile);
    });

    it('should set up auth state change listener', async () => {
      mockSupabase.auth.getSession.mockResolvedValueOnce({
        data: { session: null },
      });

      await useAuthStore.getState().initialize();

      expect(mockSupabase.auth.onAuthStateChange).toHaveBeenCalled();
    });

    it('should handle initialization errors gracefully', async () => {
      mockSupabase.auth.getSession.mockRejectedValueOnce(new Error('Network error'));

      await useAuthStore.getState().initialize();

      // Should still set isLoading to false
      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });
});
