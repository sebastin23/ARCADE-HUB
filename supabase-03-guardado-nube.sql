-- Neón Buggy · guardado de monedas, coches y logros en la nube
create table if not exists saves (
  user_id uuid primary key references profiles(id) on delete cascade,
  data jsonb not null check (pg_column_size(data) < 20000),
  ts bigint not null default 0,
  updated_at timestamptz default now()
);
alter table saves enable row level security;

drop policy if exists "ver mi guardado" on saves;
create policy "ver mi guardado" on saves for select to authenticated using (user_id = auth.uid());
drop policy if exists "crear mi guardado" on saves;
create policy "crear mi guardado" on saves for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "actualizar mi guardado" on saves;
create policy "actualizar mi guardado" on saves for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
