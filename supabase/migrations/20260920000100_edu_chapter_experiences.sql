create table if not exists public.edu_journey_chapters (
  id uuid primary key default gen_random_uuid(),
  journey_id uuid not null references public.edu_journeys(id) on delete cascade,
  chapter_number integer not null,
  title text,
  start_page integer not null default 1,
  end_page integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint edu_journey_chapters_range_check check (start_page > 0 and end_page >= start_page),
  constraint edu_journey_chapters_unique unique (journey_id, chapter_number)
);

create table if not exists public.edu_chapter_experiences (
  id uuid primary key default gen_random_uuid(),
  journey_id uuid not null references public.edu_journeys(id) on delete cascade,
  chapter_number integer not null,
  experience_type text not null,
  area text not null default 'interpretation',
  title text not null,
  prompt text not null,
  payload jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint edu_chapter_experiences_unique unique (journey_id, chapter_number, sort_order)
);

create table if not exists public.edu_chapter_experience_responses (
  id uuid primary key default gen_random_uuid(),
  experience_id uuid not null references public.edu_chapter_experiences(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  response jsonb not null default '{}'::jsonb,
  is_correct boolean,
  feedback text,
  answered_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint edu_chapter_experience_responses_unique unique (experience_id, user_id, class_id)
);

create table if not exists public.edu_chapter_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  journey_id uuid references public.edu_journeys(id) on delete set null,
  chapter_number integer not null,
  session_id uuid references public.edu_reading_sessions(id) on delete set null,
  reflection_count integer not null default 0,
  completed_at timestamptz not null default now(),
  constraint edu_chapter_completions_unique unique (user_id, class_id, chapter_number)
);

create index if not exists edu_journey_chapters_lookup_idx
  on public.edu_journey_chapters(journey_id, chapter_number);

create index if not exists edu_chapter_experiences_lookup_idx
  on public.edu_chapter_experiences(journey_id, chapter_number, sort_order);

create index if not exists edu_chapter_experience_responses_user_idx
  on public.edu_chapter_experience_responses(user_id, class_id, answered_at desc);

create index if not exists edu_chapter_experience_responses_experience_idx
  on public.edu_chapter_experience_responses(experience_id, answered_at desc);

create index if not exists edu_chapter_completions_user_idx
  on public.edu_chapter_completions(user_id, class_id, completed_at desc);

alter table public.edu_journey_chapters enable row level security;
alter table public.edu_chapter_experiences enable row level security;
alter table public.edu_chapter_experience_responses enable row level security;
alter table public.edu_chapter_completions enable row level security;

drop policy if exists "journey owners manage chapter maps" on public.edu_journey_chapters;
create policy "journey owners manage chapter maps"
  on public.edu_journey_chapters for all
  using (
    exists (
      select 1 from public.edu_journeys j
      where j.id = journey_id and j.teacher_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.edu_journeys j
      where j.id = journey_id and j.teacher_id = auth.uid()
    )
  );

drop policy if exists "students can read assigned chapter maps" on public.edu_journey_chapters;
create policy "students can read assigned chapter maps"
  on public.edu_journey_chapters for select
  using (
    exists (
      select 1
      from public.edu_journey_classes jc
      join public.class_members cm on cm.class_id = jc.class_id
      where jc.journey_id = edu_journey_chapters.journey_id
        and cm.user_id = auth.uid()
    )
  );

drop policy if exists "journey owners manage chapter experiences" on public.edu_chapter_experiences;
create policy "journey owners manage chapter experiences"
  on public.edu_chapter_experiences for all
  using (
    exists (
      select 1 from public.edu_journeys j
      where j.id = journey_id and j.teacher_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.edu_journeys j
      where j.id = journey_id and j.teacher_id = auth.uid()
    )
  );

drop policy if exists "students can read assigned chapter experiences" on public.edu_chapter_experiences;
create policy "students can read assigned chapter experiences"
  on public.edu_chapter_experiences for select
  using (
    exists (
      select 1
      from public.edu_journey_classes jc
      join public.class_members cm on cm.class_id = jc.class_id
      where jc.journey_id = edu_chapter_experiences.journey_id
        and cm.user_id = auth.uid()
    )
    and is_active = true
  );

drop policy if exists "students manage own chapter experience responses" on public.edu_chapter_experience_responses;
create policy "students manage own chapter experience responses"
  on public.edu_chapter_experience_responses for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "teachers read chapter experience responses" on public.edu_chapter_experience_responses;
create policy "teachers read chapter experience responses"
  on public.edu_chapter_experience_responses for select
  using (
    exists (
      select 1
      from public.classes c
      where c.id = class_id and c.teacher_id = auth.uid()
    )
  );

drop policy if exists "students manage own chapter completions" on public.edu_chapter_completions;
create policy "students manage own chapter completions"
  on public.edu_chapter_completions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "teachers read chapter completions" on public.edu_chapter_completions;
create policy "teachers read chapter completions"
  on public.edu_chapter_completions for select
  using (
    exists (
      select 1
      from public.classes c
      where c.id = class_id and c.teacher_id = auth.uid()
    )
  );

-- Teachers can see the contextual moments and reading events of their own classes.
drop policy if exists "teachers read student moments for own classes" on public.edu_student_moments;
create policy "teachers read student moments for own classes"
  on public.edu_student_moments for select
  using (
    exists (
      select 1 from public.classes c
      where c.id = class_id and c.teacher_id = auth.uid()
    )
  );

drop policy if exists "teachers read journey events for own classes" on public.edu_journey_events;
create policy "teachers read journey events for own classes"
  on public.edu_journey_events for select
  using (
    exists (
      select 1 from public.classes c
      where c.id = class_id and c.teacher_id = auth.uid()
    )
  );
