-- Users
create table users (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  name text,
  google_id text unique,
  created_at timestamptz default now(),
  last_login timestamptz
);

-- Analyses (each time user runs analysis)
create table analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  session_id text not null,
  user_name text,
  answers jsonb,
  signal_chips jsonb,
  readiness_score integer,
  top_roles jsonb,
  skill_gaps jsonb,
  scout_message text,
  project_recommendation jsonb,
  jobs_analyzed integer,
  job_data_snapshot jsonb,
  location text,
  timeline_months integer,
  created_at timestamptz default now()
);

-- Job cache (prevent redundant scraping)
create table job_cache (
  id uuid primary key default gen_random_uuid(),
  role text not null,
  location text not null,
  job_data jsonb,
  fetched_at timestamptz default now(),
  expires_at timestamptz default now() + interval '24 hours'
);

-- Milestones (project progress)
create table milestones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  analysis_id uuid references analyses(id) on delete cascade,
  week_number integer,
  task_text text,
  completed boolean default false,
  completed_at timestamptz,
  created_at timestamptz default now()
);

-- Indexes
create index idx_analyses_user_id on analyses(user_id);
create index idx_analyses_session_id on analyses(session_id);
create index idx_job_cache_role_location on job_cache(role, location);
create index idx_job_cache_expires on job_cache(expires_at);

-- RLS
alter table users enable row level security;
alter table analyses enable row level security;
alter table milestones enable row level security;
