import Link from "next/link";
import { signIn } from "@/lib/auth";
import { redirect } from "next/navigation";

export default function LoginPage() {
  async function handleLogin(formData: FormData) {
    "use server";

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      return;
    }

    try {
      await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      // Redirect to contacts after successful sign-in
      redirect("/contacts");
    } catch (err: any) {
    // NextAuth throws on redirect, so we re-throw to let Next.js handle it
      if (err?.message?.includes("NEXT_REDIRECT")) {
        throw err;
      }
      console.error("Login error:", err);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <form action={handleLogin} className="w-full max-w-sm space-y-4 rounded-lg bg-white p-8 shadow">
        <h1 className="text-2xl font-bold">Sign in</h1>
        <input name="email" type="email" placeholder="Email" required className="w-full rounded border px-3 py-2" />
        <input name="password" type="password" placeholder="Password" required className="w-full rounded border px-3 py-2" />
        <button type="submit" className="w-full rounded bg-blue-600 py-2 text-white">Sign in</button>
        <p className="text-sm text-gray-500">
          No account? <Link href="/register" className="underline">Register</Link>
        </p>
      </form>
    </main>
  );
}