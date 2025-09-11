// app/sign-up/page.tsx
import { signUpWithPassword } from '../(auth)/actions';

export default function SignUpPage() {
  return (
    <main className="mx-auto max-w-sm p-6">
      <h1 className="text-xl font-semibold mb-4">Create account</h1>
      <form action={signUpWithPassword} className="space-y-3">
        <input type="email" name="email" required placeholder="you@example.com" className="w-full border p-2 rounded" />
        <input type="password" name="password" required placeholder="••••••••" className="w-full border p-2 rounded" />
        <button type="submit" className="w-full border rounded p-2">Sign up</button>
      </form>
    </main>
  );
}
