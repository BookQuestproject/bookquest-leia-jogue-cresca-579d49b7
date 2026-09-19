create table if not exists public.edu_reading_sessions (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 class_id uuid not null references public.classes(id) on delete cascade, book_id text, chapter_number integer,
 started_page integer not null default 0, ended_page integer, target_minutes integer not null default 20,
 elapsed_seconds integer not null default 0, status text not null default 'active',
 started_at timestamptz not null default now(), paused_at timestamptz, completed_at timestamptz,
 updated_at timestamptz not null default now()
);
create index if not exists edu_reading_sessions_user_idx on public.edu_reading_sessions(user_id,class_id,started_at desc);

create table if not exists public.edu_journey_events (
 id uuid primary key default gen_random_uuid(), event_id uuid not null unique,
 user_id uuid not null references auth.users(id) on delete cascade, class_id uuid references public.classes(id) on delete set null,
 session_id uuid references public.edu_reading_sessions(id) on delete set null, event_type text not null,
 chapter_number integer, page_number integer, payload jsonb not null default '{}'::jsonb, created_at timestamptz not null default now()
);
create index if not exists edu_journey_events_user_idx on public.edu_journey_events(user_id,created_at desc);

create table if not exists public.edu_student_moments (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 class_id uuid not null references public.classes(id) on delete cascade, session_id uuid references public.edu_reading_sessions(id) on delete set null,
 chapter_number integer, page_number integer not null, moment_type text not null, note text, created_at timestamptz not null default now()
);
create index if not exists edu_student_moments_user_idx on public.edu_student_moments(user_id,class_id,created_at desc);

alter table public.edu_reading_sessions enable row level security;
alter table public.edu_journey_events enable row level security;
alter table public.edu_student_moments enable row level security;
drop policy if exists "students own reading sessions" on public.edu_reading_sessions;
create policy "students own reading sessions" on public.edu_reading_sessions for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
drop policy if exists "students own journey events" on public.edu_journey_events;
create policy "students own journey events" on public.edu_journey_events for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
drop policy if exists "students own moments" on public.edu_student_moments;
create policy "students own moments" on public.edu_student_moments for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
