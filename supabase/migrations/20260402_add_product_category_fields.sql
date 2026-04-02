alter table public.products
add column if not exists category text,
add column if not exists brand text,
add column if not exists club_type text,
add column if not exists flex text,
add column if not exists hand text,
add column if not exists divider_count integer,
add column if not exists weight text;

update public.products
set category = case
  when category is not null then category
  when size like 'EU %' then 'shoes'
  when coalesce(title, '') <> '' then 'clothing'
  else 'other'
end
where category is null;

alter table public.products
alter column category set default 'clothing';

update public.products
set category = 'other'
where category not in ('clothing', 'shoes', 'clubs', 'bags', 'gloves', 'accessories', 'other');

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'products_category_check'
  ) then
    alter table public.products
    add constraint products_category_check
    check (category in ('clothing', 'shoes', 'clubs', 'bags', 'gloves', 'accessories', 'other'));
  end if;
end $$;