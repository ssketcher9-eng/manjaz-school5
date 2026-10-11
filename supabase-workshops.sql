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
