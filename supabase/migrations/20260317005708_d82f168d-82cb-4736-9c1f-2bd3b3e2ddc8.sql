
-- Sync existing users' assigned_tier based on their current XP
UPDATE public.user_xp SET assigned_tier = 
  CASE 
    WHEN xp >= 13000 THEN 'legendary'
    WHEN xp >= 8000 THEN 'diamond'
    WHEN xp >= 5200 THEN 'quartz'
    WHEN xp >= 3200 THEN 'ruby'
    WHEN xp >= 1900 THEN 'amethyst'
    WHEN xp >= 1100 THEN 'emerald'
    WHEN xp >= 600 THEN 'sapphire'
    WHEN xp >= 300 THEN 'gold'
    WHEN xp >= 100 THEN 'silver'
    ELSE 'bronze'
  END;
