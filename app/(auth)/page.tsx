// app/auth/page.tsx
import { signInWithPassword, signUpWithPassword } from './actions';

export default function AuthPage() {
  return (
    <main className="mx-auto max-w-sm p-6">
      <section className="mb-8">
        <h2 className="font-semibold mb-2">Sign in</h2>
        <form action={signInWithPassword} className="space-y-3">
          <input name="email" type="email" required className="w-full border p-2 rounded" placeholder="you@example.com" />
          <input name="password" type="password" required className="w-full border p-2 rounded" placeholder="••••••••" />
          <button className="w-full border rounded p-2">Sign in</button>
        </form>
      </section>
      <section>
        <h2 className="font-semibold mb-2">Sign up</h2>
        <form action={signUpWithPassword} className="space-y-3">
          <input name="email" type="email" required className="w-full border p-2 rounded" />
          <input name="password" type="password" required className="w-full border p-2 rounded" />
          <button className="w-full border rounded p-2">Create account</button>
        </form>
      </section>
    </main>
  );
}
