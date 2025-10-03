-- Trigger to auto-create user profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, name, phone, address, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'name', 'Usuario'),
    coalesce(new.raw_user_meta_data ->> 'phone', null),
    coalesce(new.raw_user_meta_data ->> 'address', null),
    coalesce(new.raw_user_meta_data ->> 'role', 'client')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
