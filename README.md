# CourseGeneratorMK2

# CourseGen MVP (Codespaces)

An MVP for a multi-agent course generator using **Next.js** + **Supabase**. The current flow is synchronous: **Outline → Text → Image → Insert into Supabase**.

## Quick Start (Codespaces)

1. **Create a new GitHub repo** and paste these files.
2. Click **Code → Codespaces → Create codespace on main**.
3. Copy `env.example` to `.env.local` and fill in:

- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

4. Apply the database schema (run once):

- Either via Supabase SQL editor, or locally: paste `supabase/migrations/001_init.sql` and `supabase/policies.sql` into your project SQL.

5. Start the dev server:

```bash
npm install
npm run dev
## Now create a course
curl -X POST http://localhost:3000/api/generate \
  -H 'Content-Type: application/json' \
  -d '{
    "course_title":"Statistical Mechanics I",
    "course_level":"undergraduate",
    "source_style":"project-based",
    "learner_level":"calculus-ready"
  }'
```
