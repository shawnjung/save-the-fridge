import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { suggestRecipes, type ParticipantIngredients, type RecipeSuggestion } from '@/lib/anthropic';

export type MingleSession = {
  id: string;
  created_by: string;
  title: string | null;
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
  expires_at: string | null;
};

export type MingleParticipant = {
  id: string;
  session_id: string;
  user_id: string;
  joined_at: string;
  profile?: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
};

export type MingleSuggestion = {
  id: string;
  session_id: string;
  recipe_name: string;
  description: string | null;
  ingredients_used: RecipeSuggestion['ingredients_used'];
  missing_ingredients: RecipeSuggestion['missing_ingredients'];
  instructions: string | null;
  match_score: number | null;
  created_at: string;
};

type MingleState = {
  sessions: MingleSession[];
  currentSession: MingleSession | null;
  participants: MingleParticipant[];
  suggestions: MingleSuggestion[];
  isLoading: boolean;
  fetchSessions: () => Promise<void>;
  createSession: (title: string, friendIds: string[]) => Promise<string>;
  fetchSessionDetails: (sessionId: string) => Promise<void>;
  generateSuggestions: (sessionId: string) => Promise<void>;
  updateSessionStatus: (sessionId: string, status: MingleSession['status']) => Promise<void>;
};

export const useMingleStore = create<MingleState>((set, get) => ({
  sessions: [],
  currentSession: null,
  participants: [],
  suggestions: [],
  isLoading: false,

  fetchSessions: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('mingle_sessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ sessions: (data as MingleSession[]) ?? [] });
    } finally {
      set({ isLoading: false });
    }
  },

  createSession: async (title: string, friendIds: string[]) => {
    const { data: { session: authSession } } = await supabase.auth.getSession();
    if (!authSession) throw new Error('Not authenticated');

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const { data: mingleSession, error: sessionError } = await supabase
      .from('mingle_sessions')
      .insert({
        created_by: authSession.user.id,
        title,
        status: 'active',
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (sessionError) throw sessionError;

    const participants = [authSession.user.id, ...friendIds].map((userId) => ({
      session_id: (mingleSession as MingleSession).id,
      user_id: userId,
    }));

    const { error: participantError } = await supabase
      .from('mingle_participants')
      .insert(participants);

    if (participantError) throw participantError;

    return (mingleSession as MingleSession).id;
  },

  fetchSessionDetails: async (sessionId: string) => {
    set({ isLoading: true });
    try {
      const { data: session, error: sessionError } = await supabase
        .from('mingle_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (sessionError) throw sessionError;

      const { data: participants, error: participantError } = await supabase
        .from('mingle_participants')
        .select(`
          *,
          profile:profiles!mingle_participants_user_id_fkey(username, display_name, avatar_url)
        `)
        .eq('session_id', sessionId);

      if (participantError) throw participantError;

      const { data: suggestions, error: suggestionsError } = await supabase
        .from('mingle_suggestions')
        .select('*')
        .eq('session_id', sessionId)
        .order('match_score', { ascending: false });

      if (suggestionsError) throw suggestionsError;

      set({
        currentSession: session as MingleSession,
        participants: (participants as MingleParticipant[]) ?? [],
        suggestions: (suggestions as MingleSuggestion[]) ?? [],
      });
    } finally {
      set({ isLoading: false });
    }
  },

  generateSuggestions: async (sessionId: string) => {
    const { participants } = get();

    const participantIngredients: ParticipantIngredients[] = [];

    for (const participant of participants) {
      const { data: items } = await supabase
        .from('shelf_items')
        .select('name, quantity, unit, category')
        .eq('user_id', participant.user_id)
        .eq('is_shared', true);

      participantIngredients.push({
        userId: participant.user_id,
        displayName: participant.profile?.display_name ?? participant.profile?.username ?? 'User',
        items: (items ?? []).map((i: Record<string, unknown>) => ({
          name: i.name as string,
          quantity: i.quantity as number,
          unit: i.unit as string,
          category: i.category as string,
        })),
      });
    }

    const recipes = await suggestRecipes(participantIngredients);

    // Insert suggestions (would normally be done by service role)
    for (const recipe of recipes) {
      await supabase.from('mingle_suggestions').insert({
        session_id: sessionId,
        recipe_name: recipe.recipe_name,
        description: recipe.description,
        ingredients_used: recipe.ingredients_used,
        missing_ingredients: recipe.missing_ingredients,
        instructions: recipe.instructions,
        match_score: recipe.match_score,
      });
    }

    await get().fetchSessionDetails(sessionId);
  },

  updateSessionStatus: async (sessionId: string, status: MingleSession['status']) => {
    const { error } = await supabase
      .from('mingle_sessions')
      .update({ status })
      .eq('id', sessionId);

    if (error) throw error;
    await get().fetchSessions();
  },
}));
