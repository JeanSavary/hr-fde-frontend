"use client";

import { NegotiationForm } from "@/components/settings/negotiation-form";
import { useSettings } from "@/lib/swr";

export default function SettingsPage() {
  const { data: settings, error, isLoading } = useSettings();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">
        Negotiation Settings
      </h1>
      {error && !settings ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
          Failed to load settings.
        </div>
      ) : isLoading && !settings ? (
        <div className="text-sm text-gray-500">Loading...</div>
      ) : settings ? (
        <NegotiationForm initialSettings={settings} />
      ) : null}
    </div>
  );
}
