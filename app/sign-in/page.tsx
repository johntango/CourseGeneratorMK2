// app/sign-in/page.tsx
import { sendMagicLink } from './actions';

export default function SignInPage() {
  async function action(formData: FormData) {
    'use server';
    const email = String(formData.get('email') || '').trim();
    if (!email) throw new Error('Email required');
    await sendMagicLink(email);
  }

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-semibold mb-4">Sign in</h1>
      <form action={action} className="space-y-4">
        <label className="block">
          <span className="block mb-1">Email</span>
          <input
            type="email"
            name="email"
            required
            className="w-full border rounded p-2"
            placeholder="you@example.com"
          />
        </label>
        <button className="rounded px-4 py-2 border" type="submit">
          Send magic link
        </button>
      </form>
      <p className="mt-3 text-sm">Check your inbox and follow the link.</p>
    </main>
  );
}
