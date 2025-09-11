// components/AuthHeader.tsx
import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase-server';

export default async function AuthHeader() {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <>
        <li className="nav-item">
          <Link className="nav-link text-white fw-medium" href="/sign-in">
            Sign in
          </Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link text-white fw-medium" href="/sign-up">
            Sign up
          </Link>
        </li>
      </>
    );
  }

  return (
    <>
      <li className="nav-item">
        <span className="navbar-text text-white-50 me-2">
          Signed in as {user.email}
        </span>
      </li>
      <li className="nav-item">
        <form action="/auth/sign-out" method="post" className="d-inline">
          <button type="submit" className="btn btn-outline-light btn-sm">
            Sign out
          </button>
        </form>
      </li>
    </>
  );
}
