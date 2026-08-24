-- ChefFlow schema.
--
-- Access model: every row belongs to exactly one signed-in user. The Supabase
-- anon key is baked into the published JavaScript and is therefore public, so
-- RLS is the only thing standing between the internet and this data. Each
-- policy below is `auth.uid() = user_id`, which means the anon role — a request
-- with no session — matches nothing at all and sees an empty table.
--
-- Never add an `anon` policy to these tables.

create extension if not exists "pgcrypto";

-- Keep updated_at honest without the client having to remember to send it.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- ---------------------------------------------------------------------------
-- Recipes
-- ---------------------------------------------------------------------------

create table if not exists public.recipes (
  id                 uuid primary key default gen_random_uuid(),
  -- Defaulted from the session so an insert never has to send it, and RLS
  -- rejects the row if anything tries to write someone else's id.
  user_id            uuid        not null default auth.uid()
                     references auth.users (id) on delete cascade,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  title              text        not null,
  description        text        not null default '',
  image_url          text        not null default '',
  prep_time_minutes  integer     not null default 0,
  cook_time_minutes  integer     not null default 0,
  servings           integer     not null default 0,
  -- [{ name, quantity, unit, category }]
  ingredients        jsonb       not null default '[]'::jsonb,
  steps              text[]      not null default '{}',
  tags               text[]      not null default '{}',
  notes              text        not null default '',
  source             text        not null default '',
  -- { calories, protein_g, carbs_g, fat_g, fiber_g } or null
  macros             jsonb
);

-- The recipe list is always "mine, most recently edited first".
create index if not exists recipes_user_updated_idx
  on public.recipes (user_id, updated_at desc);

drop trigger if exists recipes_touch_updated_at on public.recipes;
create trigger recipes_touch_updated_at
  before update on public.recipes
  for each row execute function public.touch_updated_at();

alter table public.recipes enable row level security;

drop policy if exists "recipes are private to their owner" on public.recipes;
create policy "recipes are private to their owner"
  on public.recipes for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- ---------------------------------------------------------------------------
-- Cook plans ("to cook next")
-- ---------------------------------------------------------------------------

create table if not exists public.cook_plans (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid        not null default auth.uid()
               references auth.users (id) on delete cascade,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  -- Deleting a recipe clears any plan that pointed at it, so the Plan page
  -- never has to render around a dangling reference.
  recipe_id    uuid        not null references public.recipes (id) on delete cascade,
  status       text        not null default 'planned'
               check (status in ('planned', 'cooking', 'done')),
  planned_date date
);

create index if not exists cook_plans_user_status_idx
  on public.cook_plans (user_id, status, created_at desc);

drop trigger if exists cook_plans_touch_updated_at on public.cook_plans;
create trigger cook_plans_touch_updated_at
  before update on public.cook_plans
  for each row execute function public.touch_updated_at();

alter table public.cook_plans enable row level security;

drop policy if exists "cook plans are private to their owner" on public.cook_plans;
create policy "cook plans are private to their owner"
  on public.cook_plans for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- ---------------------------------------------------------------------------
-- Shopping list
-- ---------------------------------------------------------------------------

create table if not exists public.shopping_items (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid        not null default auth.uid()
                references auth.users (id) on delete cascade,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  name          text        not null,
  quantity      text        not null default '',
  unit          text        not null default '',
  category      text        not null default 'Other',
  checked       boolean     not null default false,
  -- Plain uuid[]/text[], deliberately not foreign keys: an item stays on the
  -- list (and keeps saying where it came from) after its recipe is deleted.
  recipe_ids    uuid[]      not null default '{}',
  recipe_titles text[]      not null default '{}'
);

create index if not exists shopping_items_user_updated_idx
  on public.shopping_items (user_id, updated_at desc);

drop trigger if exists shopping_items_touch_updated_at on public.shopping_items;
create trigger shopping_items_touch_updated_at
  before update on public.shopping_items
  for each row execute function public.touch_updated_at();

alter table public.shopping_items enable row level security;

drop policy if exists "shopping items are private to their owner" on public.shopping_items;
create policy "shopping items are private to their owner"
  on public.shopping_items for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- ---------------------------------------------------------------------------
-- Storage: uploaded recipe photos.
--
-- Public bucket so <img src> works straight from the static site without
-- signing every URL. Writes are restricted to a folder named after the user's
-- id, so nobody can overwrite or delete another account's photos.
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'recipe-images',
  'recipe-images',
  true,
  10485760, -- 10 MB
  array['image/jpeg','image/png','image/webp','image/gif','image/avif']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "recipe images readable by everyone" on storage.objects;
drop policy if exists "recipe images insert by owner"      on storage.objects;
drop policy if exists "recipe images update by owner"      on storage.objects;
drop policy if exists "recipe images delete by owner"      on storage.objects;

create policy "recipe images readable by everyone"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'recipe-images');

create policy "recipe images insert by owner"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'recipe-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "recipe images update by owner"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'recipe-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'recipe-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "recipe images delete by owner"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'recipe-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
