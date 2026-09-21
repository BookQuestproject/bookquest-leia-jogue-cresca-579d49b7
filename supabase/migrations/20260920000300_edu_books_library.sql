create table if not exists public.edu_books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text,
  cover_url text,
  total_pages integer,
  genre text,
  description text,
  theme_color text,
  source_book_id text unique,
  created_by uuid not null references auth.users(id) on delete cascade,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.edu_book_chapters (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.edu_books(id) on delete cascade,
  chapter_number integer not null,
  title text not null,
  start_page integer not null default 1,
  end_page integer not null default 1,
  context_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (book_id, chapter_number)
);

create table if not exists public.edu_book_questions (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.edu_books(id) on delete cascade,
  chapter_number integer not null,
  question_type text not null default 'multiple_choice',
  question_text text not null,
  options jsonb not null default '[]'::jsonb,
  correct_answer integer,
  explanation text,
  source text not null default 'teacher',
  created_by uuid not null references auth.users(id) on delete cascade,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.class_questions
  add column if not exists book_question_id uuid references public.edu_book_questions(id) on delete set null;

create unique index if not exists class_questions_book_question_unique
  on public.class_questions(class_id, book_question_id);

create index if not exists edu_books_created_by_idx
  on public.edu_books(created_by, created_at desc);

create index if not exists edu_book_chapters_book_idx
  on public.edu_book_chapters(book_id, chapter_number);

create index if not exists edu_book_questions_book_chapter_idx
  on public.edu_book_questions(book_id, chapter_number, created_at desc);

alter table public.edu_books enable row level security;
alter table public.edu_book_chapters enable row level security;
alter table public.edu_book_questions enable row level security;

drop policy if exists "teachers read edu books" on public.edu_books;
create policy "teachers read edu books"
  on public.edu_books for select
  using (
    auth.uid() is not null
    and (
      created_by = auth.uid()
      or exists (select 1 from public.teachers t where t.user_id = auth.uid())
    )
  );

drop policy if exists "teachers create edu books" on public.edu_books;
create policy "teachers create edu books"
  on public.edu_books for insert
  with check (
    auth.uid() = created_by
    and exists (select 1 from public.teachers t where t.user_id = auth.uid())
  );

drop policy if exists "owners update edu books" on public.edu_books;
create policy "owners update edu books"
  on public.edu_books for update
  using (created_by = auth.uid())
  with check (created_by = auth.uid());

drop policy if exists "owners delete edu books" on public.edu_books;
create policy "owners delete edu books"
  on public.edu_books for delete
  using (created_by = auth.uid());

drop policy if exists "teachers read edu book chapters" on public.edu_book_chapters;
create policy "teachers read edu book chapters"
  on public.edu_book_chapters for select
  using (
    exists (
      select 1
      from public.edu_books b
      where b.id = edu_book_chapters.book_id
        and (
          b.created_by = auth.uid()
          or exists (select 1 from public.teachers t where t.user_id = auth.uid())
        )
    )
  );

drop policy if exists "book owners manage chapters" on public.edu_book_chapters;
create policy "book owners manage chapters"
  on public.edu_book_chapters for all
  using (
    exists (
      select 1 from public.edu_books b
      where b.id = edu_book_chapters.book_id
        and b.created_by = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.edu_books b
      where b.id = edu_book_chapters.book_id
        and b.created_by = auth.uid()
    )
  );

drop policy if exists "teachers read edu book questions" on public.edu_book_questions;
create policy "teachers read edu book questions"
  on public.edu_book_questions for select
  using (
    exists (
      select 1
      from public.edu_books b
      where b.id = edu_book_questions.book_id
        and (
          b.created_by = auth.uid()
          or exists (select 1 from public.teachers t where t.user_id = auth.uid())
        )
    )
  );

drop policy if exists "book owners manage questions" on public.edu_book_questions;
create policy "book owners manage questions"
  on public.edu_book_questions for all
  using (
    exists (
      select 1 from public.edu_books b
      where b.id = edu_book_questions.book_id
        and b.created_by = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.edu_books b
      where b.id = edu_book_questions.book_id
        and b.created_by = auth.uid()
    )
  );

create or replace function public.sync_edu_book_question_to_classes(_book_question_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  q public.edu_book_questions%rowtype;
  synced integer := 0;
begin
  select * into q
  from public.edu_book_questions
  where id = _book_question_id
    and is_active = true;

  if not found then
    return 0;
  end if;

  insert into public.class_questions (
    class_id,
    chapter_number,
    created_by,
    question_text,
    book_question_id
  )
  select
    c.id,
    q.chapter_number,
    auth.uid(),
    q.question_text,
    q.id
  from public.classes c
  where c.book_id = q.book_id
  on conflict (class_id, book_question_id)
  do update set
    chapter_number = excluded.chapter_number,
    question_text = excluded.question_text;

  get diagnostics synced = row_count;
  return synced;
end;
$$;
