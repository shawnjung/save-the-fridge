-- Save the Fridge: Row Level Security Policies
-- Enables RLS and creates all required policies

-- ============================================================
-- ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shelf_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mingle_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mingle_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mingle_suggestions ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PROFILES POLICIES
-- ============================================================

-- Any authenticated user can read any profile (needed for friend search)
CREATE POLICY "profiles_select_authenticated"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- Users can update only their own profile
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Allow insert for the trigger (service role) and for authenticated users creating their own profile
CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- ============================================================
-- SHELF ITEMS POLICIES
-- ============================================================

-- Users can select their own shelf items
CREATE POLICY "shelf_items_select_own"
  ON public.shelf_items FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can select shared items from friends
CREATE POLICY "shelf_items_select_friends_shared"
  ON public.shelf_items FOR SELECT
  TO authenticated
  USING (
    is_shared = true
    AND user_id IN (SELECT public.get_friends(auth.uid()))
  );

-- Users can insert their own shelf items
CREATE POLICY "shelf_items_insert_own"
  ON public.shelf_items FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update their own shelf items
CREATE POLICY "shelf_items_update_own"
  ON public.shelf_items FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own shelf items
CREATE POLICY "shelf_items_delete_own"
  ON public.shelf_items FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================================
-- FRIENDSHIPS POLICIES
-- ============================================================

-- Users can see friendships where they are requester or addressee
CREATE POLICY "friendships_select_involved"
  ON public.friendships FOR SELECT
  TO authenticated
  USING (requester_id = auth.uid() OR addressee_id = auth.uid());

-- Users can insert a friendship where they are the requester
CREATE POLICY "friendships_insert_requester"
  ON public.friendships FOR INSERT
  TO authenticated
  WITH CHECK (requester_id = auth.uid());

-- Only the addressee can update a friendship (to accept or block)
CREATE POLICY "friendships_update_addressee"
  ON public.friendships FOR UPDATE
  TO authenticated
  USING (addressee_id = auth.uid())
  WITH CHECK (addressee_id = auth.uid());

-- ============================================================
-- MINGLE SESSIONS POLICIES
-- ============================================================

-- Authenticated users can create sessions (they become created_by)
CREATE POLICY "mingle_sessions_insert_authenticated"
  ON public.mingle_sessions FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- Only participants can select a session
CREATE POLICY "mingle_sessions_select_participant"
  ON public.mingle_sessions FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT session_id FROM public.mingle_participants
      WHERE user_id = auth.uid()
    )
  );

-- Only the creator can update session status
CREATE POLICY "mingle_sessions_update_creator"
  ON public.mingle_sessions FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- ============================================================
-- MINGLE PARTICIPANTS POLICIES
-- ============================================================

-- Participants can see other participants in sessions they belong to
CREATE POLICY "mingle_participants_select_in_session"
  ON public.mingle_participants FOR SELECT
  TO authenticated
  USING (
    session_id IN (
      SELECT session_id FROM public.mingle_participants
      WHERE user_id = auth.uid()
    )
  );

-- Users can insert themselves as a participant
CREATE POLICY "mingle_participants_insert_self"
  ON public.mingle_participants FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- ============================================================
-- MINGLE SUGGESTIONS POLICIES
-- ============================================================

-- Only session participants can view suggestions
CREATE POLICY "mingle_suggestions_select_participant"
  ON public.mingle_suggestions FOR SELECT
  TO authenticated
  USING (
    session_id IN (
      SELECT session_id FROM public.mingle_participants
      WHERE user_id = auth.uid()
    )
  );

-- Only the service role can insert suggestions (AI-generated)
-- No INSERT policy for authenticated users; only service_role can insert
CREATE POLICY "mingle_suggestions_insert_service_role"
  ON public.mingle_suggestions FOR INSERT
  TO service_role
  WITH CHECK (true);
