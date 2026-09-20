create table if not exists public.edu_student_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  avatar_id text not null,
  reading_experience text not null,
  reading_frequency text not null,
  routine_minutes integer not null default 15,
  preferred_days integer[] not null default '{1,2,3,4,5}',
  reading_barrier text not null,
  reading_motivation text not null,
  preferred_support text not null,
  daily_goal_pages integer not null default 10,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint edu_student_preferences_user_unique unique (user_id),
  constraint edu_student_preferences_routine_check check (routine_minutes between 5 and 120),
  constraint edu_student_preferences_goal_check check (daily_goal_pages between 1 and 100)
);

create index if not exists edu_student_preferences_user_idx
  on public.edu_student_preferences(user_id);

alter table public.edu_student_preferences enable row level security;

drop policy if exists "students manage own preferences" on public.edu_student_preferences;
create policy "students manage own preferences"
  on public.edu_student_preferences for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "teachers read student preferences in own classes" on public.edu_student_preferences;
create policy "teachers read student preferences in own classes"
  on public.edu_student_preferences for select
  using (
    exists (
      select 1
      from public.class_members cm
      join public.classes c on c.id = cm.class_id
      where cm.user_id = edu_student_preferences.user_id
        and c.teacher_id = auth.uid()
    )
  );
