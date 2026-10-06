"use client";
import { useEffect, useState } from "react";
import { signIn } from "@/lib/auth";

interface User {
  id: string;
  email: string;
  name?: string | null;
  role: string;
  status: string;
  pressCardUrl?: string | null;
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => (r.status === 401 ? window.location.assign("/login") : r.json()))
      .then(setUsers)
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setUsers(users.map((u) => (u.id === id ? { ...u, status } : u)));
  };

  if (loading) return <p className="p-8">Loading…</p>;

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Panel — User Approvals</h1>
      <table className="w-full border text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">Email</th>
            <th className="p-2 text-left">Role</th>
            <th className="p-2 text-left">Status</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t">
              <td className="p-2">{u.email}</td>
              <td className="p-2">{u.role}</td>
              <td className="p-2">
                <span
                  className={`rounded px-2 py-0.5 text-xs ${
                    u.status === "APPROVED"
                      ? "bg-green-100 text-green-700"
                      : u.status === "REJECTED"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {u.status}
                </span>
              </td>
              <td className="p-2 flex gap-2 justify-center">
                {u.status === "PENDING" && (
                  <>
                    <button
                      onClick={() => updateStatus(u.id, "APPROVED")}
                      className="rounded bg-green-600 px-3 py-1 text-white text-xs"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => updateStatus(u.id, "REJECTED")}
                      className="rounded bg-red-600 px-3 py-1 text-white text-xs"
                    >
                      Reject
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
