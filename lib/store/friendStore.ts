import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export type FriendshipStatus = 'pending' | 'accepted' | 'blocked';

export type Friendship = {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: FriendshipStatus;
  created_at: string;
  other_user: {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
};

export type SearchedUser = {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
};

type FriendState = {
  friends: Friendship[];
  pendingReceived: Friendship[];
  pendingSent: Friendship[];
  isLoading: boolean;
  fetchFriends: () => Promise<void>;
  sendRequest: (addresseeId: string) => Promise<void>;
  acceptRequest: (friendshipId: string) => Promise<void>;
  blockUser: (friendshipId: string) => Promise<void>;
  searchUsers: (query: string) => Promise<SearchedUser[]>;
};

export const useFriendStore = create<FriendState>((set) => ({
  friends: [],
  pendingReceived: [],
  pendingSent: [],
  isLoading: false,

  fetchFriends: async () => {
    set({ isLoading: true });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const userId = session.user.id;

      const { data, error } = await supabase
        .from('friendships')
        .select(`
          id,
          requester_id,
          addressee_id,
          status,
          created_at,
          requester:profiles!friendships_requester_id_fkey(id, username, display_name, avatar_url),
          addressee:profiles!friendships_addressee_id_fkey(id, username, display_name, avatar_url)
        `)
        .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);

      if (error) throw error;

      const all = (data ?? []).map((f: Record<string, unknown>) => {
        const requester = f.requester as Record<string, unknown> | null;
        const addressee = f.addressee as Record<string, unknown> | null;
        const isRequester = f.requester_id === userId;
        const otherProfile = isRequester ? addressee : requester;
        return {
          id: f.id as string,
          requester_id: f.requester_id as string,
          addressee_id: f.addressee_id as string,
          status: f.status as FriendshipStatus,
          created_at: f.created_at as string,
          other_user: {
            id: (otherProfile?.id as string) ?? '',
            username: (otherProfile?.username as string) ?? '',
            display_name: (otherProfile?.display_name as string | null) ?? null,
            avatar_url: (otherProfile?.avatar_url as string | null) ?? null,
          },
        };
      });

      set({
        friends: all.filter((f) => f.status === 'accepted'),
        pendingReceived: all.filter(
          (f) => f.status === 'pending' && f.addressee_id === userId
        ),
        pendingSent: all.filter(
          (f) => f.status === 'pending' && f.requester_id === userId
        ),
      });
    } finally {
      set({ isLoading: false });
    }
  },

  sendRequest: async (addresseeId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const { error } = await supabase.from('friendships').insert({
      requester_id: session.user.id,
      addressee_id: addresseeId,
      status: 'pending',
    });

    if (error) throw error;
  },

  acceptRequest: async (friendshipId: string) => {
    const { error } = await supabase
      .from('friendships')
      .update({ status: 'accepted' })
      .eq('id', friendshipId);

    if (error) throw error;
  },

  blockUser: async (friendshipId: string) => {
    const { error } = await supabase
      .from('friendships')
      .update({ status: 'blocked' })
      .eq('id', friendshipId);

    if (error) throw error;
  },

  searchUsers: async (query: string): Promise<SearchedUser[]> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return [];

    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url')
      .ilike('username', `%${query}%`)
      .neq('id', session.user.id)
      .limit(20);

    if (error) throw error;
    return (data as SearchedUser[]) ?? [];
  },
}));
