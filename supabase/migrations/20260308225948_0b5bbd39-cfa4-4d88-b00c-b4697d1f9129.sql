
-- Book Reviews table
CREATE TABLE public.book_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  book_id TEXT NOT NULL,
  book_title TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, book_id)
);

ALTER TABLE public.book_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews" ON public.book_reviews FOR SELECT USING (true);
CREATE POLICY "Users can insert own reviews" ON public.book_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON public.book_reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reviews" ON public.book_reviews FOR DELETE USING (auth.uid() = user_id);

-- Book Clubs table
CREATE TABLE public.book_clubs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  book_id TEXT NOT NULL,
  book_title TEXT NOT NULL,
  book_cover TEXT,
  created_by UUID NOT NULL,
  max_members INTEGER DEFAULT 50,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.book_clubs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active clubs" ON public.book_clubs FOR SELECT USING (is_active = true);
CREATE POLICY "Premium and admins can create clubs" ON public.book_clubs FOR INSERT WITH CHECK (
  auth.uid() = created_by AND (
    has_role(auth.uid(), 'admin') OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_premium = true AND (premium_expires_at IS NULL OR premium_expires_at > now()))
  )
);
CREATE POLICY "Creator and admins can update clubs" ON public.book_clubs FOR UPDATE USING (auth.uid() = created_by OR has_role(auth.uid(), 'admin'));
CREATE POLICY "Creator and admins can delete clubs" ON public.book_clubs FOR DELETE USING (auth.uid() = created_by OR has_role(auth.uid(), 'admin'));

-- Book Club Members table
CREATE TABLE public.book_club_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  club_id UUID NOT NULL REFERENCES public.book_clubs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  current_chapter INTEGER DEFAULT 0,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(club_id, user_id)
);

ALTER TABLE public.book_club_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view club members" ON public.book_club_members FOR SELECT USING (true);
CREATE POLICY "Users can join clubs" ON public.book_club_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own membership" ON public.book_club_members FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can leave clubs" ON public.book_club_members FOR DELETE USING (auth.uid() = user_id);

-- Book Club Discussions table
CREATE TABLE public.book_club_discussions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  club_id UUID NOT NULL REFERENCES public.book_clubs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  chapter_ref INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.book_club_discussions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view discussions" ON public.book_club_discussions FOR SELECT USING (
  EXISTS (SELECT 1 FROM book_club_members WHERE club_id = book_club_discussions.club_id AND user_id = auth.uid())
  OR has_role(auth.uid(), 'admin')
);
CREATE POLICY "Members can post discussions" ON public.book_club_discussions FOR INSERT WITH CHECK (
  auth.uid() = user_id AND 
  EXISTS (SELECT 1 FROM book_club_members WHERE club_id = book_club_discussions.club_id AND user_id = auth.uid())
);
CREATE POLICY "Users can delete own discussions" ON public.book_club_discussions FOR DELETE USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

-- Enable realtime for discussions
ALTER PUBLICATION supabase_realtime ADD TABLE public.book_club_discussions;
