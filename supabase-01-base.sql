-- Neón Buggy Infinito · configuración de Supabase
-- Pega TODO esto en SQL Editor → New query → Run (una sola vez)

-- ============ TABLAS ============
create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  name text not null check (name ~ '^[A-Za-z0-9_]{3,14}$'),
  name_lower text generated always as (lower(name)) stored unique,
  created_at timestamptz default now()
);

create table if not exists friends (
  user_id uuid references profiles(id) on delete cascade,
  friend_id uuid references profiles(id) on delete cascade,
  primary key (user_id, friend_id),
  check (user_id <> friend_id)
);

create table if not exists daily_scores (
  day date not null,
  user_id uuid references profiles(id) on delete cascade,
  dist int not null default 0 check (dist between 0 and 30000),
  gold int not null default 0 check (gold between 0 and 20000),
  primary key (day, user_id)
);
create index if not exists daily_dist_idx on daily_scores (day, dist desc);
create index if not exists daily_gold_idx on daily_scores (day, gold desc);

create table if not exists alltime (
  user_id uuid primary key references profiles(id) on delete cascade,
  dist int not null default 0 check (dist between 0 and 30000),
  gold int not null default 0 check (gold between 0 and 20000)
);

-- ============ SEGURIDAD (RLS) ============
alter table profiles enable row level security;
alter table friends enable row level security;
alter table daily_scores enable row level security;
alter table alltime enable row level security;

drop policy if exists "ver perfiles" on profiles;
create policy "ver perfiles" on profiles for select to authenticated using (true);
drop policy if exists "crear mi perfil" on profiles;
create policy "crear mi perfil" on profiles for insert to authenticated with check (id = auth.uid());

drop policy if exists "ver mis amigos" on friends;
create policy "ver mis amigos" on friends for select to authenticated using (user_id = auth.uid());
drop policy if exists "añadir amigo" on friends;
create policy "añadir amigo" on friends for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "quitar amigo" on friends;
create policy "quitar amigo" on friends for delete to authenticated using (user_id = auth.uid());

-- daily_scores y alltime no tienen políticas: nadie las toca directamente,
-- solo a través de las funciones de abajo (que usan la fecha del servidor).

-- ============ FUNCIONES ============
create or replace function server_now() returns timestamptz
language sql stable as $$ select now() $$;

create or replace function submit_run(p_dist int, p_gold int) returns json
language plpgsql security definer set search_path = public as $$
declare
  today date := (now() at time zone 'utc')::date;
  pd int := 0; pg int := 0; nd int; ng int; rd int; rg int;
begin
  if auth.uid() is null or not exists (select 1 from profiles where id = auth.uid()) then
    raise exception 'sin perfil';
  end if;
  p_dist := least(greatest(coalesce(p_dist, 0), 0), 30000);
  p_gold := least(greatest(coalesce(p_gold, 0), 0), 20000);

  select s.dist, s.gold into pd, pg from daily_scores s where s.day = today and s.user_id = auth.uid();
  pd := coalesce(pd, 0); pg := coalesce(pg, 0);

  insert into daily_scores as s (day, user_id, dist, gold) values (today, auth.uid(), p_dist, p_gold)
  on conflict (day, user_id) do update
    set dist = greatest(s.dist, excluded.dist), gold = greatest(s.gold, excluded.gold)
  returning s.dist, s.gold into nd, ng;

  insert into alltime as a (user_id, dist, gold) values (auth.uid(), p_dist, p_gold)
  on conflict (user_id) do update
    set dist = greatest(a.dist, excluded.dist), gold = greatest(a.gold, excluded.gold);

  select count(*) + 1 into rd from daily_scores s where s.day = today and s.dist > nd;
  select count(*) + 1 into rg from daily_scores s where s.day = today and s.gold > ng;

  return json_build_object('d', nd, 'g', ng, 'rd', rd, 'rg', rg, 'pd', pd, 'pg', pg);
end $$;

create or replace function board(p_scope text, p_field text)
returns table (uid uuid, name text, val int)
language sql stable security definer set search_path = public as $$
  select p.id, p.name,
         case when p_field = 'g' then s.gold else s.dist end as val
  from (
    select user_id, dist, gold from daily_scores
      where p_scope = 'daily' and day = (now() at time zone 'utc')::date
    union all
    select user_id, dist, gold from alltime where p_scope <> 'daily'
  ) s
  join profiles p on p.id = s.user_id
  where (case when p_field = 'g' then s.gold else s.dist end) > 0
  order by 3 desc
  limit 15
$$;

create or replace function friends_list()
returns table (uid uuid, name text, td int, tg int, ad int)
language sql stable security definer set search_path = public as $$
  select p.id, p.name, coalesce(s.dist, 0), coalesce(s.gold, 0), coalesce(a.dist, 0)
  from friends f
  join profiles p on p.id = f.friend_id
  left join daily_scores s on s.user_id = p.id and s.day = (now() at time zone 'utc')::date
  left join alltime a on a.user_id = p.id
  where f.user_id = auth.uid()
  order by p.name
$$;
