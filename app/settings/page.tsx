"use client";

import { NegotiationForm } from "@/components/settings/negotiation-form";
import { useSettings } from "@/lib/swr";
import { SettingsFormSkeleton } from "@/components/shared/skeletons";

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
        <SettingsFormSkeleton />
      ) : settings ? (
        <NegotiationForm initialSettings={settings} />
      ) : null}
    </div>
  );
}
