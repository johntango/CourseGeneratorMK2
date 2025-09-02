-- Core schema (MVP)
title text not null,
position int not null default 1,
unique(course_id, slug)
);


create table if not exists lessons (
id uuid primary key default gen_random_uuid(),
module_id uuid not null references modules(id) on delete cascade,
slug text not null,
title text not null,
summary text,
content_md text,
content_html text,
published boolean not null default true,
position int not null default 1,
updated_at timestamptz default now(),
unique(module_id, slug)
);


create table if not exists assets (
id uuid primary key default gen_random_uuid(),
course_id uuid references courses(id) on delete cascade,
storage_path text not null,
content_type text,
is_public boolean not null default true,
created_at timestamptz default now()
);


create table if not exists generation_jobs (
id uuid primary key default gen_random_uuid(),
prompt jsonb not null,
status text not null check (status in ('queued','running','completed','failed')),
created_at timestamptz default now(),
updated_at timestamptz default now()
);


create table if not exists artifacts (
id uuid primary key default gen_random_uuid(),
job_id uuid not null references generation_jobs(id) on delete cascade,
entity_type text not null check (entity_type in ('course','module','lesson','asset','quiz')),
entity_id uuid,
artifact_type text not null, -- 'outline'|'text'|'image'|'quiz'
content jsonb,
created_at timestamptz default now()
);


create table if not exists questions (
id uuid primary key default gen_random_uuid(),
lesson_id uuid references lessons(id) on delete cascade,
type text check (type in ('mcq','short','long')) default 'mcq',
difficulty int default 2,
stem text,
options jsonb,
answer jsonb,
solution text,
est_time_minutes int default 2
);