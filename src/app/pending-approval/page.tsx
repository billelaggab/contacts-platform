import { signIn } from "@/lib/auth";

export default function PendingApproval() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-yellow-50">
      <div className="max-w-md rounded-lg bg-white p-8 shadow text-center">
        <h1 className="text-2xl font-bold text-yellow-700">Awaiting Approval</h1>
        <p className="mt-4 text-gray-600">
          Your press card is under review. An admin will verify your credentials and activate your
          account. You&apos;ll be notified by email once approved.
        </p>
        <form action={signIn.bind(null, "google", { redirectTo: "/" })} className="mt-6">
          <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white">
            Continue with Google
          </button>
        </form>
      </div>
    </main>
  );
}
