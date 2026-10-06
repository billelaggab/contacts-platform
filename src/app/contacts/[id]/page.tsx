"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

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
  contactType: string;
  specialization?: string | null;
  country?: string | null;
  city?: string | null;
  _canRequest?: boolean;
  phoneNumbers?: Phone[];
}

export default function ContactDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/v1/contacts`)
      .then((r) => (r.status === 401 ? router.replace("/login") : r.json()))
      .then((data) => {
        const found = data.find((c: Contact) => c.id === params.id);
        if (!found) router.replace("/contacts");
        setContact(found);
      })
      .catch(() => router.replace("/contacts"))
      .finally(() => setLoading(false));
  }, [params.id, router]);

  if (loading) return <p className="p-8">Loading…</p>;
  if (!contact) return null;

  const isVipMasked = contact.contactType === "VIP" && contact._canRequest;
  const isPrivate = contact.contactType === "PRIVATE";

  return (
    <main className="max-w-3xl mx-auto p-6">
      {isPrivate && (
        <div className="mb-4 rounded bg-red-50 border border-red-200 px-4 py-2 text-red-700 text-sm">
          🔒 Strict Confidentiality Charter — this contact is private to you only.
          Administrative access is audited and logged.
        </div>
      )}

      <div className="flex items-center gap-4">
        <img
          src={contact.avatarUrl ?? "/placeholder.svg"}
          alt={contact.fullName}
          className="h-20 w-20 rounded-full object-cover"
        />
        <div>
          <h1 className="text-2xl font-bold">{contact.fullName}</h1>
          <p className="text-gray-600">
            {contact.currentJobTitle}{contact.currentJobTitle && contact.organization ? " · " : ""}
            {contact.organization}
          </p>
          <span className="inline-block rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600 mt-1">
            {contact.contactType}
          </span>
        </div>
      </div>

      <section className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Contact Details</h2>
        {isVipMasked ? (
          <div className="rounded border bg-yellow-50 p-4 text-center">
            <p className="text-gray-600">Contact details are hidden for VIPs.</p>
            <button className="mt-2 rounded bg-blue-600 px-4 py-2 text-white">
              Request Contact Details
            </button>
          </div>
        ) : (
          <ul className="space-y-1">
            {contact.email && (
              <li className="text-sm">
                ✉️ {contact.email}
              </li>
            )}
            {(contact.phoneNumbers ?? []).map((p) => (
              <li key={p.id} className="text-sm">
                📞 {p.phoneNumber} ({p.label})
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Location</h2>
        <p className="text-sm text-gray-600">
          {[contact.specialization, contact.country, contact.city].filter(Boolean).join(" · ") || "N/A"}
        </p>
      </section>
    </main>
  );
}
