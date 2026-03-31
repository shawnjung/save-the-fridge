const mockGetSession = jest.fn().mockResolvedValue({
  data: { session: null },
  error: null,
});
const mockSignInWithPassword = jest.fn().mockResolvedValue({
  data: {},
  error: null,
});
const mockSignUp = jest.fn().mockResolvedValue({
  data: {},
  error: null,
});
const mockSignOut = jest.fn().mockResolvedValue({ error: null });
const mockOnAuthStateChange = jest.fn().mockReturnValue({
  data: { subscription: { unsubscribe: jest.fn() } },
});

const mockFrom = jest.fn();
const mockStorage = {
  from: jest.fn(() => ({
    upload: jest.fn().mockResolvedValue({ error: null }),
    getPublicUrl: jest.fn().mockReturnValue({
      data: { publicUrl: 'https://example.com/avatar.jpg' },
    }),
  })),
};

const mockCreateClient = jest.fn(() => ({
  auth: {
    getSession: mockGetSession,
    signInWithPassword: mockSignInWithPassword,
    signUp: mockSignUp,
    signOut: mockSignOut,
    onAuthStateChange: mockOnAuthStateChange,
  },
  from: mockFrom,
  storage: mockStorage,
}));

jest.mock('@supabase/supabase-js', () => ({
  createClient: mockCreateClient,
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
}));

describe('Supabase client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a Supabase client with createClient', () => {
    // Re-import to trigger the module
    jest.isolateModules(() => {
      require('@/lib/supabase');
    });
    expect(mockCreateClient).toHaveBeenCalled();
  });

  it('should configure auth with correct options', () => {
    jest.isolateModules(() => {
      require('@/lib/supabase');
    });

    const callArgs = mockCreateClient.mock.calls[0];
    const options = callArgs[2];

    expect(options.auth.autoRefreshToken).toBe(true);
    expect(options.auth.persistSession).toBe(true);
    expect(options.auth.detectSessionInUrl).toBe(false);
  });

  it('should use AsyncStorage for session storage', () => {
    jest.isolateModules(() => {
      require('@/lib/supabase');
    });

    const callArgs = mockCreateClient.mock.calls[0];
    const options = callArgs[2];

    expect(options.auth.storage).toBeDefined();
  });
});
