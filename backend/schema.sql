-- Jalankan di Supabase > SQL Editor

create table if not exists grades (
  id serial primary key,
  name text unique not null,
  scale text
);

create table if not exists kits (
  id serial primary key,
  name text not null,
  series text,
  grade_id int references grades(id),
  image_url text,
  progress_photos jsonb not null default '{}'::jsonb,
  check_head_torso boolean not null default false,
  check_arms boolean not null default false,
  check_legs boolean not null default false,
  check_weapons boolean not null default false,
  check_decal boolean not null default false,
  check_topcoat boolean not null default false,
  progress int not null default 0,
  status text not null default 'Backlog',
  created_at timestamptz not null default now()
);

-- Untuk database yang sudah dibuat sebelumnya (aman dijalankan ulang)
alter table kits add column if not exists progress_photos jsonb not null default '{}'::jsonb;

create table if not exists build_logs (
  id serial primary key,
  kit_id int not null references kits(id) on delete cascade,
  title text not null,
  technique text,
  notes text,
  work_date date not null default current_date
);

insert into grades (name, scale) values
  ('HG', '1/144'), ('RG', '1/144'), ('MG', '1/100'), ('PG', '1/60'), ('SD', null)
on conflict (name) do nothing;

-- Tabel dibuat tanpa RLS (sama seperti Modul 1) agar bisa diakses dengan anon key
alter table grades disable row level security;
alter table kits disable row level security;
alter table build_logs disable row level security;

-- Bucket publik untuk foto kit
insert into storage.buckets (id, name, public)
values ('kit-images', 'kit-images', true)
on conflict (id) do nothing;

-- Izinkan anon key mengunggah foto ke bucket kit-images
drop policy if exists "anon upload kit-images" on storage.objects;
create policy "anon upload kit-images" on storage.objects
  for insert to anon with check (bucket_id = 'kit-images');

-- Pastikan API (anon key) boleh membaca/menulis tabel, walau "Automatically expose new tables" tidak dicentang
grant usage on schema public to anon, authenticated;
grant all on all tables in schema public to anon, authenticated;
grant all on all sequences in schema public to anon, authenticated;

-- Data contoh: hanya dimasukkan kalau tabel kits masih kosong (aman dijalankan ulang)
do $$
begin
  if not exists (select 1 from kits) then
    insert into kits (name, series, grade_id, check_head_torso, check_arms, check_legs, check_weapons, progress, status)
    select 'Gundam Barbatos', 'Iron-Blooded Orphans', id, true, true, true, false, 75, 'On Progress' from grades where name = 'MG';

    insert into kits (name, series, grade_id, check_head_torso, check_arms, check_legs, check_weapons, check_decal, check_topcoat, progress, status)
    select 'Destiny Spec II', 'Gundam SEED Freedom', id, true, true, true, true, true, true, 100, 'Completed' from grades where name = 'HG';

    insert into kits (name, series, grade_id)
    select 'Astray Red Frame', 'Gundam SEED Astray', id from grades where name = 'RG';
  end if;
end $$;
