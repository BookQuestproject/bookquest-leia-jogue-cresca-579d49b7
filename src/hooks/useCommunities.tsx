import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface Community {
  id: string;
  book_id: string;
  title: string;
  author: string;
  cover: string | null;
  description: string | null;
  member_count: number;
  post_count: number;
  is_member: boolean;
}

export interface CommunityPost {
  id: string;
  community_id: string;
  user_id: string;
  content: string;
  sticker: string | null;
  likes_count: number;
  reposts_count: number;
  created_at: string;
  profile?: { full_name: string | null; avatar_url: string | null; username: string | null };
  comments: CommunityComment[];
  liked: boolean;
  bookmarked: boolean;
}

export interface CommunityComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  sticker: string | null;
  created_at: string;
  profile?: { full_name: string | null; avatar_url: string | null; username: string | null };
}

export const useCommunities = () => {
  const { user } = useAuth();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCommunities = useCallback(async () => {
    setLoading(true);
    try {
      const { data: comms, error } = await supabase
        .from('literary_communities')
        .select('*')
        .eq('is_active', true)
        .order('title');

      if (error) throw error;

      const commIds = (comms || []).map(c => c.id);

      // Get member counts
      const { data: members } = await supabase
        .from('community_members')
        .select('community_id, user_id')
        .in('community_id', commIds);

      // Get post counts
      const { data: posts } = await supabase
        .from('community_posts')
        .select('community_id')
        .in('community_id', commIds);

      const enriched: Community[] = (comms || []).map(c => {
        const mems = (members || []).filter(m => m.community_id === c.id);
        const psts = (posts || []).filter(p => p.community_id === c.id);
        return {
          ...c,
          member_count: mems.length,
          post_count: psts.length,
          is_member: user ? mems.some(m => m.user_id === user.id) : false,
        };
      });

      setCommunities(enriched);
    } catch (err) {
      console.error('Error fetching communities:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCommunities();
  }, [fetchCommunities]);

  return { communities, loading, refetch: fetchCommunities };
};

export const useCommunityDetail = (communityId: string | null) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    if (!communityId) return;
    setLoading(true);
    try {
      const { data: postsData, error } = await supabase
        .from('community_posts')
        .select('*')
        .eq('community_id', communityId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const postIds = (postsData || []).map(p => p.id);
      const userIds = [...new Set((postsData || []).map(p => p.user_id))];

      // Fetch comments
      const { data: comments } = postIds.length > 0
        ? await supabase
            .from('community_comments')
            .select('*')
            .in('post_id', postIds)
            .order('created_at', { ascending: true })
        : { data: [] };

      // Collect all user ids from comments too
      const commentUserIds = (comments || []).map(c => c.user_id);
      const allUserIds = [...new Set([...userIds, ...commentUserIds])];

      // Fetch profiles
      const { data: profiles } = allUserIds.length > 0
        ? await supabase.from('profiles_public' as any).select('id, full_name, avatar_url, username').in('id', allUserIds)
        : { data: [] };

      const profileMap = new Map(((profiles as any[]) || []).map((p: any) => [p.id, p]));

      // Fetch user likes
      let userLikes = new Set<string>();
      if (user && postIds.length > 0) {
        const { data: likes } = await supabase
          .from('community_post_likes')
          .select('post_id')
          .eq('user_id', user.id)
          .in('post_id', postIds);
        userLikes = new Set((likes || []).map(l => l.post_id));
      }

      // Fetch user bookmarks
      let userBookmarks = new Set<string>();
      if (user && postIds.length > 0) {
        const { data: bmarks } = await supabase
          .from('community_post_bookmarks')
          .select('post_id')
          .eq('user_id', user.id)
          .in('post_id', postIds);
        userBookmarks = new Set((bmarks || []).map(b => b.post_id));
      }

      const enrichedPosts: CommunityPost[] = (postsData || []).map(p => ({
        ...p,
        profile: profileMap.get(p.user_id) || { full_name: null, avatar_url: null },
        comments: (comments || [])
          .filter(c => c.post_id === p.id)
          .map(c => ({
            ...c,
            profile: profileMap.get(c.user_id) || { full_name: null, avatar_url: null },
          })),
        liked: userLikes.has(p.id),
        bookmarked: userBookmarks.has(p.id),
      }));

      setPosts(enrichedPosts);
    } catch (err) {
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  }, [communityId, user]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Realtime
  useEffect(() => {
    if (!communityId) return;
    const channel = supabase
      .channel(`community-${communityId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'community_posts', filter: `community_id=eq.${communityId}` }, () => fetchPosts())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'community_comments' }, () => fetchPosts())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [communityId, fetchPosts]);

  const joinCommunity = async () => {
    if (!user || !communityId) return false;
    try {
      const { error } = await supabase.from('community_members').insert({ community_id: communityId, user_id: user.id });
      if (error) throw error;
      toast({ title: '✅ Você entrou na comunidade!' });
      return true;
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
      return false;
    }
  };

  const leaveCommunity = async () => {
    if (!user || !communityId) return false;
    try {
      const { error } = await supabase.from('community_members').delete().eq('community_id', communityId).eq('user_id', user.id);
      if (error) throw error;
      toast({ title: 'Você saiu da comunidade' });
      return true;
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
      return false;
    }
  };

  const createPost = async (content: string, sticker?: string) => {
    if (!user || !communityId) return false;
    try {
      const { error } = await supabase.from('community_posts').insert({
        community_id: communityId,
        user_id: user.id,
        content,
        sticker: sticker || null,
      });
      if (error) throw error;
      return true;
    } catch (err: any) {
      toast({ title: 'Erro ao postar', description: err.message, variant: 'destructive' });
      return false;
    }
  };

  const addComment = async (postId: string, content: string, sticker?: string) => {
    if (!user) return false;
    try {
      const { error } = await supabase.from('community_comments').insert({
        post_id: postId,
        user_id: user.id,
        content,
        sticker: sticker || null,
      });
      if (error) throw error;
      return true;
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
      return false;
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!user) return false;
    try {
      const { error } = await supabase
        .from('community_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id);
      if (error) throw error;
      await fetchPosts();
      return true;
    } catch (err: any) {
      toast({ title: 'Erro ao excluir', description: err.message, variant: 'destructive' });
      return false;
    }
  };

  const toggleLike = async (postId: string, isLiked: boolean) => {
    if (!user) return;
    try {
      if (isLiked) {
        await supabase.from('community_post_likes').delete().eq('post_id', postId).eq('user_id', user.id);
      } else {
        await supabase.from('community_post_likes').insert({ post_id: postId, user_id: user.id });
      }
      await fetchPosts();
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  const toggleBookmark = async (postId: string, isBookmarked: boolean) => {
    if (!user) return;
    try {
      if (isBookmarked) {
        await supabase.from('community_post_bookmarks').delete().eq('post_id', postId).eq('user_id', user.id);
      } else {
        await supabase.from('community_post_bookmarks').insert({ post_id: postId, user_id: user.id });
      }
      await fetchPosts();
    } catch (err) {
      console.error('Error toggling bookmark:', err);
    }
  };

  return {
    posts,
    loading,
    joinCommunity,
    leaveCommunity,
    createPost,
    addComment,
    deleteComment,
    toggleLike,
    toggleBookmark,
    refetch: fetchPosts,
  };
};
