import Link from "next/link";
import { signIn } from "@/lib/auth";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <form
        action={async (formData) => {
          "use server";
          await signIn("credentials", {
            email: formData.get("email"),
            password: formData.get("password"),
            redirectTo: "/contacts",
          });
        }}
        className="w-full max-w-sm space-y-4 rounded-lg bg-white p-8 shadow"
      >
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
