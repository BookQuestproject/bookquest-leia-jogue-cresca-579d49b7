drop policy if exists "students read assigned edu books" on public.edu_books;
create policy "students read assigned edu books"
  on public.edu_books for select
  using (
    exists (
      select 1
      from public.class_members cm
      join public.classes c on c.id = cm.class_id
      where cm.user_id = auth.uid()
        and c.book_id = edu_books.id::text
        and c.is_active = true
    )
  );

drop policy if exists "students read assigned edu book chapters" on public.edu_book_chapters;
create policy "students read assigned edu book chapters"
  on public.edu_book_chapters for select
  using (
    exists (
      select 1
      from public.edu_books b
      join public.classes c on c.book_id = b.id::text
      join public.class_members cm on cm.class_id = c.id
      where b.id = edu_book_chapters.book_id
        and cm.user_id = auth.uid()
        and c.is_active = true
    )
  );
