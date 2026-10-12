-- منجز: جداول الورش والشهادات الرقمية
create table if not exists public.workshops (
 id uuid primary key default gen_random_uuid(), title text not null, description text not null default '', workshop_date date not null, trainer_name text not null, workshop_time time, duration text not null, created_by uuid references auth.users(id) on delete set null, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.workshop_certificates (
 id uuid primary key default gen_random_uuid(), workshop_id uuid not null references public.workshops(id) on delete cascade, recipient_name text not null, issued_by uuid references auth.users(id) on delete set null, issuer_name text not null, issued_at timestamptz not null default now()
);
alter table public.workshops enable row level security;
alter table public.workshop_certificates enable row level security;
drop policy if exists "Authenticated users can view workshops" on public.workshops;
create policy "Authenticated users can view workshops" on public.workshops for select to authenticated using (true);
drop policy if exists "Authenticated users can add workshops" on public.workshops;
create policy "Authenticated users can add workshops" on public.workshops for insert to authenticated with check (auth.uid() = created_by);
drop policy if exists "Creators or admins can update workshops" on public.workshops;
create policy "Creators or admins can update workshops" on public.workshops for update to authenticated using (auth.uid() = created_by or public.is_admin()) with check (auth.uid() = created_by or public.is_admin());
drop policy if exists "Creators or admins can delete workshops" on public.workshops;
create policy "Creators or admins can delete workshops" on public.workshops for delete to authenticated using (auth.uid() = created_by or public.is_admin());
drop policy if exists "Authenticated users can view workshop certificates" on public.workshop_certificates;
create policy "Authenticated users can view workshop certificates" on public.workshop_certificates for select to authenticated using (true);
drop policy if exists "Authenticated users can issue workshop certificates" on public.workshop_certificates;
create policy "Authenticated users can issue workshop certificates" on public.workshop_certificates for insert to authenticated with check (auth.uid() = issued_by);

-- منح صلاحيات SQL اللازمة؛ سياسات RLS أعلاه تظل مسؤولة عن تحديد الصفوف المسموح بها
grant select, insert, update, delete on public.workshops to authenticated;
grant select, insert, update, delete on public.workshop_certificates to authenticated;

-- إعداد قالب شهادة موحد محفوظ على مستوى الموقع
create table if not exists public.site_settings (
 key text primary key,
 value jsonb not null default '{}'::jsonb,
 updated_at timestamptz not null default now(),
 updated_by uuid references auth.users(id) on delete set null
);
alter table public.site_settings enable row level security;
drop policy if exists "Anyone can read certificate template setting" on public.site_settings;
create policy "Anyone can read certificate template setting" on public.site_settings for select to anon, authenticated using (key = 'certificate_template');
drop policy if exists "Admins manage certificate template setting" on public.site_settings;
create policy "Admins manage certificate template setting" on public.site_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());
grant select on public.site_settings to anon, authenticated;
grant insert, update, delete on public.site_settings to authenticated;
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('certificate-assets', 'certificate-assets', true, 8388608, array['image/png','image/jpeg','image/webp'])
on conflict (id) do update set public = true, file_size_limit = 8388608, allowed_mime_types = array['image/png','image/jpeg','image/webp'];
drop policy if exists "Public can view certificate assets" on storage.objects;
create policy "Public can view certificate assets" on storage.objects for select using (bucket_id = 'certificate-assets');
drop policy if exists "Admins upload certificate assets" on storage.objects;
create policy "Admins upload certificate assets" on storage.objects for insert to authenticated with check (bucket_id = 'certificate-assets' and public.is_admin());
drop policy if exists "Admins update certificate assets" on storage.objects;
create policy "Admins update certificate assets" on storage.objects for update to authenticated using (bucket_id = 'certificate-assets' and public.is_admin()) with check (bucket_id = 'certificate-assets' and public.is_admin());
drop policy if exists "Admins delete certificate assets" on storage.objects;
create policy "Admins delete certificate assets" on storage.objects for delete to authenticated using (bucket_id = 'certificate-assets' and public.is_admin());


-- مرفقات الورش التدريبية (صور وملفات PDF)
create table if not exists public.workshop_attachments (
 id uuid primary key default gen_random_uuid(),
 workshop_id uuid not null references public.workshops(id) on delete cascade,
 file_name text not null,
 file_path text not null unique,
 mime_type text not null check (mime_type in ('image/jpeg','image/png','image/webp','application/pdf')),
 uploaded_by uuid references auth.users(id) on delete set null,
 created_at timestamptz not null default now()
);
alter table public.workshop_attachments enable row level security;
drop policy if exists "Anyone can view workshop attachments" on public.workshop_attachments;
create policy "Anyone can view workshop attachments" on public.workshop_attachments
 for select to anon, authenticated using (true);
drop policy if exists "Workshop owners or admins add attachments" on public.workshop_attachments;
create policy "Workshop owners or admins add attachments" on public.workshop_attachments
 for insert to authenticated with check (
  auth.uid() = uploaded_by and exists (
   select 1 from public.workshops w
   where w.id = workshop_id and (w.created_by = auth.uid() or public.is_admin())
  )
);
drop policy if exists "Workshop owners or admins delete attachments" on public.workshop_attachments;
create policy "Workshop owners or admins delete attachments" on public.workshop_attachments
 for delete to authenticated using (
  exists (select 1 from public.workshops w
   where w.id = workshop_id and (w.created_by = auth.uid() or public.is_admin()))
);
grant select on public.workshop_attachments to anon, authenticated;
grant insert, delete on public.workshop_attachments to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('workshop-files', 'workshop-files', true, 10485760, array['image/jpeg','image/png','image/webp','application/pdf'])
on conflict (id) do update set public = true, file_size_limit = 10485760,
 allowed_mime_types = array['image/jpeg','image/png','image/webp','application/pdf'];
drop policy if exists "Public can view workshop files" on storage.objects;
create policy "Public can view workshop files" on storage.objects for select using (bucket_id = 'workshop-files');
drop policy if exists "Workshop owners or admins upload workshop files" on storage.objects;
create policy "Workshop owners or admins upload workshop files" on storage.objects
 for insert to authenticated with check (
  bucket_id = 'workshop-files' and exists (
   select 1 from public.workshops w
   where w.id::text = split_part(name, '/', 1)
    and (w.created_by = auth.uid() or public.is_admin())
  )
);
drop policy if exists "Workshop owners or admins delete workshop files" on storage.objects;
create policy "Workshop owners or admins delete workshop files" on storage.objects
 for delete to authenticated using (
  bucket_id = 'workshop-files' and exists (
   select 1 from public.workshops w
   where w.id::text = split_part(name, '/', 1)
    and (w.created_by = auth.uid() or public.is_admin())
  )
);
