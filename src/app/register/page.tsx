import Link from "next/link";
import { signIn } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

export default function RegisterPage() {
  async function handleRegister(formData: FormData) {
    "use server";

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      throw new Error("User with this email already exists");
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user in database with PENDING status
    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "JOURNALIST",
        status: "PENDING",
        pressCardUrl: "/uploads/sample-press-card.jpg", // placeholder for uploaded file
      },
    });

    // Sign in the user after successful registration
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/pending-approval",
    });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <form
        action={handleRegister}
        className="w-full max-w-sm space-y-4 rounded-lg bg-white p-8 shadow"
      >
        <h1 className="text-2xl font-bold">Create account</h1>
        <input
          name="name"
          type="text"
          placeholder="Full name"
          required
          className="w-full rounded border px-3 py-2"
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          className="w-full rounded border px-3 py-2"
        />
        <input
          name="password"
          type="password"
          placeholder="Password (min 6 chars)"
          required
          className="w-full rounded border px-3 py-2"
        />

        <label className="block text-sm font-medium text-gray-700">Press Card Photo</label>
        <input name="pressCard" type="file" accept="image/*" required className="w-full text-sm" />

        <button type="submit" className="w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700">
          Register
        </button>
        <p className="text-sm text-gray-500 text-center">
          Already have an account?{" "}
          <Link href="/login" className="underline text-blue-600">
            Sign in
          </Link>
        </p>
      </form>
    </main>
  );
}
