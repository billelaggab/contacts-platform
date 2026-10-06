import Link from "next/link";
import { signIn } from "@/lib/auth";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <form
        action={async (formData) => {
          "use server";
          await signIn("credentials", {
            email: formData.get("email"),
            password: formData.get("password"),
            redirectTo: "/pending-approval",
          });
        }}
        className="w-full max-w-sm space-y-4 rounded-lg bg-white p-8 shadow"
      >
        <h1 className="text-2xl font-bold">Create account</h1>
        <input name="name" type="text" placeholder="Full name" required className="w-full rounded border px-3 py-2" />
        <input name="email" type="email" placeholder="Email" required className="w-full rounded border px-3 py-2" />
        <input name="password" type="password" placeholder="Password (min 6 chars)" required className="w-full rounded border px-3 py-2" />

        <label className="block text-sm font-medium">Press Card Photo</label>
        <input name="pressCard" type="file" accept="image/*" required className="w-full text-sm" />

        <button type="submit" className="w-full rounded bg-blue-600 py-2 text-white">Register</button>
        <p className="text-sm text-gray-500">
          Already have an account? <Link href="/login" className="underline">Sign in</Link>
        </p>
      </form>
    </main>
  );
}
