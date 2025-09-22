create extension if not exists "pgcrypto";

create table if not exists public.spaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('solo', 'pair')),
  owner_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.space_members (
  space_id uuid not null references public.spaces (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  created_at timestamptz not null default now(),
  primary key (space_id, user_id)
);

create table if not exists public.places (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.spaces (id) on delete cascade,
  lat double precision not null,
  lng double precision not null,
  title text not null,
  address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.spaces (id) on delete cascade,
  place_id uuid not null references public.places (id) on delete cascade,
  visited_at date,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references public.spaces (id) on delete cascade,
  memory_id uuid not null references public.memories (id) on delete cascade,
  file_url text not null,
  width integer,
  height integer,
  created_at timestamptz not null default now()
);

create index if not exists idx_space_members_user on public.space_members (user_id);
create index if not exists idx_places_space on public.places (space_id);
create index if not exists idx_memories_space on public.memories (space_id);
create index if not exists idx_memories_place on public.memories (place_id);
create index if not exists idx_photos_memory on public.photos (memory_id);

create or replace function public.is_space_member(target_space uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.space_members sm
    where sm.space_id = target_space
      and sm.user_id = auth.uid()
  );
$$;

grant execute on function public.is_space_member to authenticated;

grant usage on schema public to authenticated;

alter table public.spaces enable row level security;
alter table public.space_members enable row level security;
alter table public.places enable row level security;
alter table public.memories enable row level security;
alter table public.photos enable row level security;

create policy "Spaces visible to members" on public.spaces
  for select
  using (public.is_space_member(id));

create policy "Spaces manageable by owner" on public.spaces
  for all
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "Members can view membership" on public.space_members
  for select
  using (public.is_space_member(space_id));

create policy "Owners manage membership" on public.space_members
  for all
  using (exists (select 1 from public.spaces s where s.id = space_members.space_id and s.owner_id = auth.uid()))
  with check (exists (select 1 from public.spaces s where s.id = space_members.space_id and s.owner_id = auth.uid()));

create policy "Members manage places" on public.places
  for all
  using (public.is_space_member(space_id))
  with check (public.is_space_member(space_id));

create policy "Members manage memories" on public.memories
  for all
  using (public.is_space_member(space_id))
  with check (public.is_space_member(space_id));

create policy "Members manage photos" on public.photos
  for all
  using (public.is_space_member(space_id))
  with check (public.is_space_member(space_id));

insert into storage.buckets (id, name, public)
values ('memories', 'memories', false)
on conflict (id) do nothing;

create policy "Members read memories bucket" on storage.objects
  for select
  using (
    bucket_id = 'memories'
    and public.is_space_member((split_part(name, '/', 1))::uuid)
  );

create policy "Members insert memories bucket" on storage.objects
  for insert
  with check (
    bucket_id = 'memories'
    and public.is_space_member((split_part(name, '/', 1))::uuid)
  );

create policy "Members update memories bucket" on storage.objects
  for update
  using (
    bucket_id = 'memories'
    and public.is_space_member((split_part(name, '/', 1))::uuid)
  )
  with check (
    bucket_id = 'memories'
    and public.is_space_member((split_part(name, '/', 1))::uuid)
  );

create policy "Members delete memories bucket" on storage.objects
  for delete
  using (
    bucket_id = 'memories'
    and public.is_space_member((split_part(name, '/', 1))::uuid)
  );

