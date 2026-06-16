-- VITALCORE SUPABASE POSTGRESQL SCHEMA
-- Premium Preventive Healthcare & AI Wellness Platform

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES TABLE (Linked to Supabase Auth.users)
create table public.profiles (
    id uuid primary key references auth.users on delete cascade,
    updated_at timestamp with time zone default timezone('utc'::text, now()),
    username text unique,
    full_name text,
    avatar_url text,
    date_of_birth date,
    gender text,
    weight_kg numeric,
    height_cm numeric,
    fitness_goal text,
    activity_level text,
    active_mode text default 'wellness' check (active_mode in ('wellness', 'performance', 'elderly')),
    soreness_level integer default 0 check (soreness_level >= 0 and soreness_level <= 10),
    biological_age numeric,
    stability_score numeric default 100 check (stability_score >= 0 and stability_score <= 100),
    onboarding_completed boolean default false,
    
    -- ONBOARDING EXTENSIONS
    bmi numeric,
    body_fat_estimate numeric,
    occupation text,
    timezone text,
    fitness_level text,
    workout_duration_preference integer,
    preferred_workout_time text,
    home_gym_preference text,
    previous_injuries text,
    chronic_conditions text,
    surgeries text,
    mobility_limitations text,
    sleep_problems boolean default false,
    dietary_preferences text,
    disliked_foods text[],
    favorite_foods text[],
    allergies text,
    meal_timing_habits text,
    caffeine_intake text,
    wearable_synced boolean default false,
    anxiety_rating integer default 0,
    motivation_level integer default 100,
    stress_level_onboard integer default 50,
    screen_time_hours numeric,
    sitting_hours numeric
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile." on public.profiles
    for select using (auth.uid() = id);

create policy "Users can update their own profile." on public.profiles
    for update using (auth.uid() = id);

create policy "Users can insert their own profile." on public.profiles
    for insert with check (auth.uid() = id);

-- WORKOUTS LOG
create table public.workouts (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.profiles(id) on delete cascade not null,
    created_at timestamp with time zone default timezone('utc'::text, now()),
    name text not null,
    type text not null,
    duration_minutes integer not null,
    intensity text check (intensity in ('low', 'medium', 'high', 'custom')),
    calories_burned integer not null,
    completed boolean default true,
    adaptive_adapted boolean default false,
    notes text
);

alter table public.workouts enable row level security;

create policy "Users can manage their own workouts." on public.workouts
    for all using (auth.uid() = user_id);

-- NUTRITION LOGS
create table public.nutrition_logs (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.profiles(id) on delete cascade not null,
    date date default current_date not null,
    created_at timestamp with time zone default timezone('utc'::text, now()),
    meal_type text not null check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')),
    food_name text not null,
    calories integer not null,
    protein_g numeric default 0,
    carbs_g numeric default 0,
    fat_g numeric default 0,
    stress_eating boolean default false,
    emotional_eating_trigger text
);

alter table public.nutrition_logs enable row level security;

create policy "Users can manage their own nutrition logs." on public.nutrition_logs
    for all using (auth.uid() = user_id);

-- HYDRATION LOGS
create table public.hydration_logs (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.profiles(id) on delete cascade not null,
    created_at timestamp with time zone default timezone('utc'::text, now()),
    amount_ml integer not null
);

alter table public.hydration_logs enable row level security;

create policy "Users can manage their own hydration logs." on public.hydration_logs
    for all using (auth.uid() = user_id);

-- SLEEP LOGS
create table public.sleep_logs (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.profiles(id) on delete cascade not null,
    date date default current_date not null,
    created_at timestamp with time zone default timezone('utc'::text, now()),
    sleep_onset text not null, -- '22:30' format
    wake_time text not null,  -- '06:30' format
    sleep_rating integer check (sleep_rating >= 1 and sleep_rating <= 10),
    night_wakings boolean default false,
    refreshment_level integer check (refreshment_level >= 1 and refreshment_level <= 10),
    sleep_hours numeric not null,
    sleep_debt numeric default 0,
    recovery_quality numeric check (recovery_quality >= 0 and recovery_quality <= 100)
);

alter table public.sleep_logs enable row level security;

create policy "Users can manage their own sleep logs." on public.sleep_logs
    for all using (auth.uid() = user_id);

-- FATIGUE LOGS
create table public.fatigue_logs (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.profiles(id) on delete cascade not null,
    created_at timestamp with time zone default timezone('utc'::text, now()),
    physical_fatigue integer check (physical_fatigue >= 0 and physical_fatigue <= 100),
    mental_fatigue integer check (mental_fatigue >= 0 and mental_fatigue <= 100),
    overtraining_risk integer check (overtraining_risk >= 0 and overtraining_risk <= 100),
    fatigue_score integer check (fatigue_score >= 0 and fatigue_score <= 100)
);

alter table public.fatigue_logs enable row level security;

create policy "Users can manage their own fatigue logs." on public.fatigue_logs
    for all using (auth.uid() = user_id);

-- RECOVERY SCORES
create table public.recovery_scores (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.profiles(id) on delete cascade not null,
    date date default current_date not null,
    created_at timestamp with time zone default timezone('utc'::text, now()),
    hrv_ms integer,
    resting_heart_rate integer,
    soreness_zones jsonb, -- Map of body parts and soreness levels
    sleep_debt_hours numeric default 0,
    recovery_percentage integer check (recovery_percentage >= 0 and recovery_percentage <= 100)
);

alter table public.recovery_scores enable row level security;

create policy "Users can manage their own recovery scores." on public.recovery_scores
    for all using (auth.uid() = user_id);

-- MOOD TRACKING
create table public.mood_tracking (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.profiles(id) on delete cascade not null,
    created_at timestamp with time zone default timezone('utc'::text, now()),
    mood text not null,
    anxiety_level integer check (anxiety_level >= 0 and anxiety_level <= 10),
    energy_level integer check (energy_level >= 0 and energy_level <= 10),
    notes text
);

alter table public.mood_tracking enable row level security;

create policy "Users can manage their own mood tracking." on public.mood_tracking
    for all using (auth.uid() = user_id);

-- AI HEALTH PREDICTIONS
create table public.ai_predictions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.profiles(id) on delete cascade not null,
    created_at timestamp with time zone default timezone('utc'::text, now()),
    prediction_type text not null,
    probability numeric check (probability >= 0 and probability <= 1),
    timeline_months integer not null,
    warning_message text not null,
    preventative_steps text[]
);

alter table public.ai_predictions enable row level security;

create policy "Users can view their own AI predictions." on public.ai_predictions
    for select using (auth.uid() = user_id);

-- SYSTEM CHALLENGES
create table public.challenges (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    description text not null,
    category text not null,
    difficulty text not null,
    xp_reward integer default 100,
    duration_days integer default 7
);

alter table public.challenges enable row level security;

create policy "Anyone can read challenges." on public.challenges
    for select to authenticated using (true);

create policy "Authenticated users can insert challenges" on public.challenges
    for insert to authenticated with check (true);

-- USER CHALLENGES (Tracking joined challenges & progress)
create table public.user_challenges (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.profiles(id) on delete cascade not null,
    challenge_id uuid references public.challenges(id) on delete cascade not null,
    joined_at timestamp with time zone default timezone('utc'::text, now()),
    progress_percentage integer default 0 check (progress_percentage >= 0 and progress_percentage <= 100),
    completed boolean default false,
    unique(user_id, challenge_id)
);

alter table public.user_challenges enable row level security;

create policy "Users can manage their joined challenges." on public.user_challenges
    for all using (auth.uid() = user_id);

-- HABITS TRACKER (Including AI excuse analyzer markers)
create table public.habits (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.profiles(id) on delete cascade not null,
    created_at timestamp with time zone default timezone('utc'::text, now()),
    name text not null,
    frequency text default 'daily',
    streak integer default 0,
    max_streak integer default 0,
    trigger_prompt text,
    excuse_pattern text
);

alter table public.habits enable row level security;

create policy "Users can manage their own habits." on public.habits
    for all using (auth.uid() = user_id);

-- NOTIFICATIONS & ALERTS
create table public.notifications (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.profiles(id) on delete cascade not null,
    created_at timestamp with time zone default timezone('utc'::text, now()),
    title text not null,
    message text not null,
    read boolean default false,
    type text not null default 'system'
);

alter table public.notifications enable row level security;

create policy "Users can manage their own notifications." on public.notifications
    for all using (auth.uid() = user_id);

-- HEALTH TIMELINE (Invisible Decline Alerts, Routine Adaptations)
create table public.health_timeline (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.profiles(id) on delete cascade not null,
    created_at timestamp with time zone default timezone('utc'::text, now()),
    event_type text not null,
    description text not null,
    severity text default 'info' check (severity in ('info', 'warning', 'critical'))
);

alter table public.health_timeline enable row level security;

create policy "Users can view their own health timeline." on public.health_timeline
    for select using (auth.uid() = user_id);

-- STRESS ANALYSIS (Productivity & sharpness analytics)
create table public.stress_analysis (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.profiles(id) on delete cascade not null,
    created_at timestamp with time zone default timezone('utc'::text, now()),
    stress_level integer not null,
    cognitive_sharpness integer not null,
    focus_duration_minutes integer not null
);

alter table public.stress_analysis enable row level security;

create policy "Users can manage their own stress analysis." on public.stress_analysis
    for all using (auth.uid() = user_id);

-- ENERGY ANALYTICS (Peak performance timing)
create table public.energy_analytics (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.profiles(id) on delete cascade not null,
    created_at timestamp with time zone default timezone('utc'::text, now()),
    peak_energy_hour integer check (peak_energy_hour >= 0 and peak_energy_hour <= 23),
    trough_energy_hour integer check (trough_energy_hour >= 0 and trough_energy_hour <= 23),
    ideal_workout_hour integer check (ideal_workout_hour >= 0 and ideal_workout_hour <= 23)
);

alter table public.energy_analytics enable row level security;

create policy "Users can manage their own energy analytics." on public.energy_analytics
    for all using (auth.uid() = user_id);

-- WEARABLE INTEGRATIONS
create table public.wearable_integrations (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.profiles(id) on delete cascade not null,
    provider text not null,
    connected boolean default false,
    last_sync timestamp with time zone
);

alter table public.wearable_integrations enable row level security;

create policy "Users can manage their own integrations." on public.wearable_integrations
    for all using (auth.uid() = user_id);

-- SUBSCRIPTIONS
create table public.subscriptions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.profiles(id) on delete cascade not null,
    tier text default 'free' check (tier in ('free', 'premium', 'elite')),
    active boolean default true,
    expires_at timestamp with time zone
);

alter table public.subscriptions enable row level security;

create policy "Users can view their subscription." on public.subscriptions
    for select using (auth.uid() = user_id);

-- TRIGGER FOR PROFILE CREATION ON SIGNUP
-- Automatically creates a profile record when a new user signs up via Supabase Auth
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

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- AI FOOD SCANNER HISTORY LOGS
create table public.food_scanner_logs (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.profiles(id) on delete cascade not null,
    created_at timestamp with time zone default timezone('utc'::text, now()),
    food_name text not null,
    calories integer not null,
    protein_g numeric default 0,
    carbs_g numeric default 0,
    fat_g numeric default 0,
    sugar_g numeric default 0,
    healthy_alternatives text[],
    health_score integer check (health_score >= 0 and health_score <= 100),
    portion_size text,
    sugar_alert boolean default false,
    additive_warnings text[],
    barcode text
);

alter table public.food_scanner_logs enable row level security;

create policy "Users can manage their own food scanner logs." on public.food_scanner_logs
    for all using (auth.uid() = user_id);

-- EMOTIONAL WELLNESS LOGS
create table public.emotional_logs (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.profiles(id) on delete cascade not null,
    created_at timestamp with time zone default timezone('utc'::text, now()),
    anxiety_level integer check (anxiety_level >= 0 and anxiety_level <= 10),
    stress_level integer check (stress_level >= 0 and stress_level <= 100),
    emotional_eating_logged boolean default false,
    burnout_risk_computed integer check (burnout_risk_computed >= 0 and burnout_risk_computed <= 100),
    notes text
);

alter table public.emotional_logs enable row level security;

create policy "Users can manage their own emotional logs." on public.emotional_logs
    for all using (auth.uid() = user_id);

-- AI CONVERSATION COHORT LOGS
create table public.ai_conversations (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.profiles(id) on delete cascade not null,
    created_at timestamp with time zone default timezone('utc'::text, now()),
    sender text check (sender in ('user', 'ai')) not null,
    message text not null
);

alter table public.ai_conversations enable row level security;

create policy "Users can manage their own AI conversations." on public.ai_conversations
    for all using (auth.uid() = user_id);

-- CONTACT INQUIRIES
create table public.contact_inquiries (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.profiles(id) on delete set null,
    created_at timestamp with time zone default timezone('utc'::text, now()),
    name text not null,
    email text not null,
    message text not null,
    status text default 'pending'
);

alter table public.contact_inquiries enable row level security;

create policy "Anyone can insert inquiries." on public.contact_inquiries
    for insert with check (true);

create policy "Users can view their own inquiries." on public.contact_inquiries
    for select using (auth.uid() = user_id);

-- COMMUNITY POSTS
create table public.community_posts (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references public.profiles(id) on delete cascade not null,
    created_at timestamp with time zone default timezone('utc'::text, now()),
    content text not null,
    streak integer default 0,
    stability_score integer default 0,
    likes integer default 0
);

alter table public.community_posts enable row level security;

create policy "Anyone can read community posts." on public.community_posts
    for select to authenticated using (true);

create policy "Authenticated users can insert community posts" on public.community_posts
    for insert to authenticated with check (auth.uid() = user_id);

create policy "Users can update their own community posts." on public.community_posts
    for update to authenticated using (auth.uid() = user_id);

