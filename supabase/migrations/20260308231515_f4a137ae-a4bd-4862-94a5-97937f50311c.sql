
-- Literary communities table
CREATE TABLE public.literary_communities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  cover TEXT,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.literary_communities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active communities" ON public.literary_communities FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage communities" ON public.literary_communities FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Community members table
CREATE TABLE public.community_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id UUID NOT NULL REFERENCES public.literary_communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(community_id, user_id)
);

ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view community members" ON public.community_members FOR SELECT USING (true);
CREATE POLICY "Users can join communities" ON public.community_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave communities" ON public.community_members FOR DELETE USING (auth.uid() = user_id);

-- Community posts table
CREATE TABLE public.community_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id UUID NOT NULL REFERENCES public.literary_communities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  sticker TEXT,
  likes_count INTEGER NOT NULL DEFAULT 0,
  reposts_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view posts" ON public.community_posts FOR SELECT USING (true);
CREATE POLICY "Members can create posts" ON public.community_posts FOR INSERT WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (SELECT 1 FROM community_members WHERE community_id = community_posts.community_id AND user_id = auth.uid())
);
CREATE POLICY "Users can delete own posts" ON public.community_posts FOR DELETE USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

-- Community post comments
CREATE TABLE public.community_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  sticker TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view comments" ON public.community_comments FOR SELECT USING (true);
CREATE POLICY "Auth users can comment" ON public.community_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON public.community_comments FOR DELETE USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

-- Post likes table
CREATE TABLE public.community_post_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE public.community_post_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view likes" ON public.community_post_likes FOR SELECT USING (true);
CREATE POLICY "Users can like" ON public.community_post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike" ON public.community_post_likes FOR DELETE USING (auth.uid() = user_id);

-- Post bookmarks table
CREATE TABLE public.community_post_bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE public.community_post_bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own bookmarks" ON public.community_post_bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can bookmark" ON public.community_post_bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove bookmark" ON public.community_post_bookmarks FOR DELETE USING (auth.uid() = user_id);

-- Enable realtime for posts and comments
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_comments;
