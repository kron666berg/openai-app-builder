alter table public.items alter column owner_id set default auth.uid();

grant select, insert, update, delete on public.items to authenticated;
revoke all on public.items from anon;

drop policy "prototype open access" on public.items;

create policy "own select" on public.items for select to authenticated using (auth.uid() = owner_id);
create policy "own insert" on public.items for insert to authenticated with check (auth.uid() = owner_id);
create policy "own update" on public.items for update to authenticated using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "own delete" on public.items for delete to authenticated using (auth.uid() = owner_id);