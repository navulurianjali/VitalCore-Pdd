-- Fix for duplicate username 500 Error during signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, full_name, avatar_url, active_mode, soreness_level, biological_age, stability_score)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1) || '_' || substr(new.id::text, 1, 6)),
    coalesce(new.raw_user_meta_data->>'full_name', 'Wellness Explorer'),
    new.raw_user_meta_data->>'avatar_url',
    'wellness',
    0,
    30.0,
    100.0
  );
  return new;
end;
$$ language plpgsql security definer;
