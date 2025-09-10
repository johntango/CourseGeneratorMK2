-- Enable RLS
alter table courses enable row level security;
alter table modules enable row level security;
alter table lessons enable row level security;
alter table assets enable row level security;


-- Public read for published content
create policy public_courses on courses for select using (visibility = 'public' and published = true);
create policy public_modules on modules for select using (
exists (select 1 from courses c where c.id = modules.course_id and c.visibility='public' and c.published)
);
create policy public_lessons on lessons for select using (
exists (
select 1 from modules m join courses c on c.id=m.course_id
where m.id = lessons.module_id and c.visibility='public' and c.published and lessons.published
)
);


-- Allow inserts/updates via service role only (default deny for anon)