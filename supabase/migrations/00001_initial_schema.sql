-- Save the Fridge: Full SQL Migration
-- Creates all tables, triggers, indexes, and helper functions

-- ============================================================
-- PROFILES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  expo_push_token TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ
);

COMMENT ON TABLE public.profiles IS 'User profiles extending auth.users';

-- ============================================================
-- SHELF ITEMS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.shelf_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category TEXT CHECK (category IN ('produce', 'dairy', 'meat', 'grain', 'condiment', 'beverage', 'other')),
  storage_type TEXT NOT NULL CHECK (storage_type IN ('fridge', 'pantry')),
  quantity NUMERIC DEFAULT 1,
  unit TEXT,
  expiry_date DATE,
  is_shared BOOLEAN DEFAULT true,
  image_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ
);

COMMENT ON TABLE public.shelf_items IS 'Food items stored in fridge or pantry';

-- ============================================================
-- FRIENDSHIPS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  addressee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ,
  UNIQUE (requester_id, addressee_id)
);

COMMENT ON TABLE public.friendships IS 'Friendship relationships between users';

-- ============================================================
-- MINGLE SESSIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.mingle_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ
);

COMMENT ON TABLE public.mingle_sessions IS 'Cook-together mingle sessions';

-- ============================================================
-- MINGLE PARTICIPANTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.mingle_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.mingle_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (session_id, user_id)
);

COMMENT ON TABLE public.mingle_participants IS 'Participants in a mingle session';

-- ============================================================
-- MINGLE SUGGESTIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.mingle_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.mingle_sessions(id) ON DELETE CASCADE,
  recipe_name TEXT NOT NULL,
  description TEXT,
  ingredients_used JSONB,
  missing_ingredients JSONB,
  instructions TEXT,
  match_score NUMERIC CHECK (match_score >= 0 AND match_score <= 100),
  created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.mingle_suggestions IS 'AI-generated recipe suggestions for mingle sessions';

-- ============================================================
-- TRIGGERS: Auto-create profile on auth.users insert
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || LEFT(NEW.id::text, 8)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'username', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- TRIGGERS: Auto-update updated_at timestamps
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS set_shelf_items_updated_at ON public.shelf_items;
CREATE TRIGGER set_shelf_items_updated_at
  BEFORE UPDATE ON public.shelf_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS set_friendships_updated_at ON public.friendships;
CREATE TRIGGER set_friendships_updated_at
  BEFORE UPDATE ON public.friendships
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_shelf_items_user_id ON public.shelf_items(user_id);
CREATE INDEX IF NOT EXISTS idx_shelf_items_expiry_date ON public.shelf_items(expiry_date);
CREATE INDEX IF NOT EXISTS idx_friendships_requester_id ON public.friendships(requester_id);
CREATE INDEX IF NOT EXISTS idx_friendships_addressee_id ON public.friendships(addressee_id);
CREATE INDEX IF NOT EXISTS idx_mingle_participants_session_id ON public.mingle_participants(session_id);

-- ============================================================
-- HELPER FUNCTION: get_friends(user_uuid)
-- Returns accepted friendship user IDs for a given user
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_friends(user_uuid UUID)
RETURNS SETOF UUID AS $$
  SELECT
    CASE
      WHEN requester_id = user_uuid THEN addressee_id
      ELSE requester_id
    END
  FROM public.friendships
  WHERE status = 'accepted'
    AND (requester_id = user_uuid OR addressee_id = user_uuid);
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ============================================================
-- HELPER FUNCTION: get_shared_items_for_user(viewer_uuid, owner_uuid)
-- Returns shared shelf_items only if viewer and owner are friends
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_shared_items_for_user(viewer_uuid UUID, owner_uuid UUID)
RETURNS SETOF public.shelf_items AS $$
  SELECT si.*
  FROM public.shelf_items si
  WHERE si.user_id = owner_uuid
    AND si.is_shared = true
    AND owner_uuid IN (SELECT public.get_friends(viewer_uuid));
$$ LANGUAGE sql STABLE SECURITY DEFINER;
