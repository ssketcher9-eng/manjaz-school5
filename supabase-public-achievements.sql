-- منجز: السماح بإضافة المنجزات العامة دون حساب
-- راجعي هذا الملف في Supabase SQL Editor وشغّليه على المشروع الصحيح قبل اختبار الإضافة.
-- لا يحذف هذا الملف أي بيانات.

alter table public.achievements enable row level security;
alter table public.achievement_attachments enable row level security;

drop policy if exists "Public visitors can submit published achievements" on public.achievements;
create policy "Public visitors can submit published achievements"
on public.achievements for insert to anon, authenticated
with check (created_by is null and status = 'published');

drop policy if exists "Public visitors can add attachment metadata" on public.achievement_attachments;
create policy "Public visitors can add attachment metadata"
on public.achievement_attachments for insert to anon, authenticated
with check (
  uploaded_by is null
  and exists (
    select 1 from public.achievements a
    where a.id = achievement_id and a.status = 'published'
  )
);

-- المرفقات العامة تُرفع داخل مجلد public/<achievement_id>/...
drop policy if exists "Public visitors can upload achievement files" on storage.objects;
create policy "Public visitors can upload achievement files"
on storage.objects for insert to anon, authenticated
with check (
  bucket_id = 'achievement-files'
  and split_part(name, '/', 1) = 'public'
  and exists (
    select 1 from public.achievements a
    where a.id::text = split_part(name, '/', 2)
      and a.status = 'published'
      and a.created_by is null
  )
);

-- منع الأعضاء من تعديل أو حذف المنجزات؛ تبقى صلاحية الإدارة عبر is_admin().
drop policy if exists "Authenticated users can update achievements" on public.achievements;
drop policy if exists "Members can update achievements" on public.achievements;
drop policy if exists "Authenticated users can delete achievements" on public.achievements;
drop policy if exists "Members can delete achievements" on public.achievements;

drop policy if exists "Only admins can update achievements" on public.achievements;
create policy "Only admins can update achievements"
on public.achievements for update to authenticated
using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Only admins can delete achievements" on public.achievements;
create policy "Only admins can delete achievements"
on public.achievements for delete to authenticated
using (public.is_admin());

-- لا نغيّر سياسات القراءة الموجودة حتى لا نكسر عرض المنجزات أو لوحة الإدارة.
