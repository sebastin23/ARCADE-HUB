-- Neón Buggy · solicitudes de amistad (pega todo en SQL Editor y pulsa Run)
create or replace function friends_list()
returns table (uid uuid, name text, td int, tg int, ad int)
language sql stable security definer set search_path = public as $$
  select p.id, p.name, coalesce(s.dist, 0), coalesce(s.gold, 0), coalesce(a.dist, 0)
  from friends f
  join friends f2 on f2.user_id = f.friend_id and f2.friend_id = f.user_id
  join profiles p on p.id = f.friend_id
  left join daily_scores s on s.user_id = p.id and s.day = (now() at time zone 'utc')::date
  left join alltime a on a.user_id = p.id
  where f.user_id = auth.uid()
  order by p.name
$$;

create or replace function friend_requests()
returns table (uid uuid, name text)
language sql stable security definer set search_path = public as $$
  select p.id, p.name
  from friends f
  join profiles p on p.id = f.user_id
  where f.friend_id = auth.uid()
    and not exists (select 1 from friends r where r.user_id = auth.uid() and r.friend_id = f.user_id)
  order by p.name
$$;

create or replace function friend_decline(p_uid uuid) returns void
language sql security definer set search_path = public as $$
  delete from friends where user_id = p_uid and friend_id = auth.uid();
$$;
