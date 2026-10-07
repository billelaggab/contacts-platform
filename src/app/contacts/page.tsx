"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Phone {
  id: string;
  phoneNumber: string;
  label: string;
  isPrimary: boolean;
}

interface Contact {
  id: string;
  fullName: string;
  currentJobTitle?: string | null;
  organization?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  contactType: "PUBLIC_PR" | "VIP" | "PRIVATE";
  specialization?: string | null;
  country?: string | null;
  city?: string | null;
  _canRequest?: boolean;
  phoneNumbers?: Phone[];
}

export default function ContactsPage() {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/v1/contacts", { credentials: "include" })
      .then((r) => {
        if (r.status === 401) {
          router.replace("/login");
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (data) setContacts(data);
      })
      .catch(() => {
        setError("فشل تحميل جهات الاتصال. حاول مرة أخرى.");
      })
      .finally(() => setLoading(false));
  }, [router]);

  const filtered = contacts.filter(
    (c) =>
      c.fullName.toLowerCase().includes(filter.toLowerCase()) ||
      (c.organization ?? "").toLowerCase().includes(filter.toLowerCase())
  );

  if (loading) return <p className="p-8 text-center text-gray-500">جاري التحميل…</p>;
  if (error) return <p className="p-8 text-center text-red-500">{error}</p>;

  return (
    <main className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">جهات الاتصال</h1>
        <Link href="/contacts/new" className="rounded bg-blue-600 px-4 py-2 text-white">
          + جهة اتصال جديدة
        </Link>
      </div>

      <input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="بحث بالاسم أو الجهة…"
        className="w-full rounded border px-3 py-2 mb-4"
      />

      <ul className="space-y-3">
        {filtered.map((c) => (
          <li key={c.id} className="rounded border bg-white p-4 shadow-sm flex items-center gap-4">
            <img
              src={c.avatarUrl ?? "/placeholder.svg"}
              alt={c.fullName}
              className="h-12 w-12 rounded-full object-cover"
            />
            <div className="flex-1">
              <Link href={`/contacts/${c.id}`} className="font-medium text-blue-600 hover:underline">
                {c.fullName}
              </Link>
              <p className="text-sm text-gray-500">
                {c.currentJobTitle}{c.currentJobTitle && c.organization ? " · " : ""}
                {c.organization}
              </p>
              <span className="inline-block rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                {c.contactType}
              </span>
            </div>
          </li>
        ))}
      </ul>

      {filtered.length === 0 && <p className="text-center text-gray-400 py-8">لا توجد جهات اتصال.</p>}
    </main>
  );
}
